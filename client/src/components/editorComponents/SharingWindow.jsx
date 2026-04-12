import axios from "axios";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../../context/Context";
import FileBar from "./FileBar";
import MonacoCodeEditor from "./MonacoCodeEditor";
import TopBar from "./TopBar";
import Terminal from "./Terminal";
import extensionMap from "./extensionMap";
import { useSocket } from "../../context/SocketProvider";

const SharingWindow = () => {
  const socket = useSocket();
  const { id } = useParams();
  const { apiUrl } = useContext(AppContext);
  const token = localStorage.getItem("token");

  const [repo, setRepo] = useState(null);
  const [terminal, setTerminal] = useState(false);
  const [fileBar, setFileBar] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [language, setLanguage] = useState(undefined);
  const [editorWidth, setEditorWidth] = useState("80vw");
  const [execResult, setExecResult] = useState();
  const [progress, setProgress] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "" | "saving" | "saved" | "error"

  // ── REFS — latest values for stable event listener ─────────────────────
  const selectedFileRef = useRef(selectedFile);
  const selectedFileContentRef = useRef(selectedFileContent);

  useEffect(() => { selectedFileRef.current = selectedFile; }, [selectedFile]);
  useEffect(() => { selectedFileContentRef.current = selectedFileContent; }, [selectedFileContent]);

  // ── FETCH REPO ────────────────────────────────────────────────────────────
  const fetchRepo = useCallback(() => {
    axios
      .get(`${apiUrl}/repo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setRepo(res.data))
      .catch(e => console.error("[SharingWindow] fetchRepo:", e));
  }, [apiUrl, id, token]);

  useEffect(() => { fetchRepo(); }, [fetchRepo]);

  // ── FILE SELECTION ─────────────────────────────────────────────────────────
  // BUG WAS HERE: previously only called setSelectedFile(file).
  // This meant:
  //   1. The Monaco editor received selectedFileContent = null → showed empty
  //   2. The language was never set → Monaco syntax highlighting was broken
  //   3. Ctrl+S sent null/empty content to the API
  //
  // Fix: set all three pieces of state when a file is selected.
  const handleFileSelection = useCallback((file) => {
    setSelectedFile(file);
    setSelectedFileContent(file.content ?? ""); // ← was missing: populate editor from DB
    setLanguage(extensionMap[file.type] || "text"); // ← was missing: set correct language
    setSaveStatus("");
  }, []);

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const saveFile = useCallback(async () => {
    const file = selectedFileRef.current;
    const content = selectedFileContentRef.current;

    // Guard: if no file selected yet, do nothing (prevents crash)
    if (!file) return;

    setSaveStatus("saving");
    try {
      await axios.post(
        `${apiUrl}/code/save/${file._id}`,
        { code: content ?? "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
      // Refresh so the in-memory repo array matches what's now in DB
      fetchRepo();
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      console.error("[SharingWindow] save failed:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }, [apiUrl, token, fetchRepo]);

  // ── KEYBOARD LISTENER ─────────────────────────────────────────────────────
  // BUG WAS HERE: previous pattern —
  //   const handleKeyDown = (event) => { ... selectedFile._id ... };  ← plain function
  //   useEffect(() => { addEventListener("keydown", handleKeyDown); }, []);  ← empty deps
  //
  // Empty deps means the listener is added ONCE on mount and captures the
  // initial selectedFile = null and selectedFileContent = null from closure.
  // Result: selectedFile._id throws TypeError; content is never saved.
  //
  // Fix: use refs so handleKeyDown reads CURRENT values, not stale closure values.
  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveFile();
    }
  }, [saveFile]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]); // ← correct: re-registers only when saveFile changes

  // ── CODE CHANGE ───────────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newValue) => {
    setSelectedFileContent(newValue);
  }, []);

  // ── RUN CODE ──────────────────────────────────────────────────────────────
  const handleRun = async () => {
    const content = selectedFileContentRef.current;
    if (!content) return;
    setTerminal(true);
    setProgress(true);
    try {
      const result = await axios.post(
        `${apiUrl}/code/run`,
        { code: content, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(false);
      setExecResult({ result: result.data.output, error: false });
    } catch (e) {
      setProgress(false);
      setExecResult({ result: e.response?.data?.error || e.message, error: true });
    }
  };

  const closeTerminal = () => setTerminal(false);
  const enableShare = false;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      <TopBar
        props={{
          handleRun,
          enableShare,
          saveFile,
          saveStatus,
          selectedFile,
        }}
      />
      <div className="flex border border-black bg-black text-white">
        {/* Sidebar toggle */}
        <div className="h-[96vh] w-[4vw] bg-gray-700 transition-all duration-300">
          <div
            className="cursor-pointer p-2 bg-gray-600 hover:bg-gray-500"
            onClick={() => {
              setFileBar(prev => !prev);
              setEditorWidth(fileBar ? "70vw" : "80vw");
            }}
          >
            Files
          </div>
        </div>

        {/* File browser */}
        {fileBar && (
          <FileBar
            props={{
              selectedFile,
              setSelectedFileFn: setSelectedFile,
              setSelectedFileContent,
              id,
              repo,
              fetchRepo,
              setLanguage,
              extensionMap,
              handleFileSelection,
            }}
          />
        )}

        {/* Editor area */}
        <div className={`h-[96vh] ${fileBar ? "w-[85vw]" : "w-[95vw]"} bg-gray-800 relative`}>
          {selectedFile ? (
            <MonacoCodeEditor
              props={{
                width: editorWidth,
                language,
                selectedFileContent,
                handleCodeChange,
              }}
            />
          ) : (
            <div className="text-center mt-20 text-gray-400">
              Select a file from the sidebar to view and edit it
            </div>
          )}
          {terminal && (
            <Terminal props={{ terminal, closeTerminal, execResult, progress }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SharingWindow;