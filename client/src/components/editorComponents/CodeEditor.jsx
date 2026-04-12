import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FileBar from "./FileBar";
import MonacoCodeEditor from "./MonacoCodeEditor";
import TopBar from "./TopBar";
import Terminal from "./Terminal";
import AppContext from "../../context/Context.jsx";
import ShareWindow from "./ShareWindow";
import { File } from "lucide-react";

const CodeEditor = () => {
  const token = localStorage.getItem("token");
  const extensionMap = {
    py: "python",
    java: "java",
    cpp: "cpp",
    js: "javascript",
    c: "c",
    txt: "text",
  };

  const { apiUrl } = useContext(AppContext);
  const [shareWindow, setShareWindow] = useState(false);
  const [editorWidth, setEditorWidth] = useState("90vw");
  const { id } = useParams();
  const [fileBar, setFileBar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminal, setTerminal] = useState(false);
  const [repo, setRepo] = useState([]);
  const [language, setLanguage] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [execResult, setExecResult] = useState();
  const [saveStatus, setSaveStatus] = useState(""); // "" | "saving" | "saved" | "error"

  // ── REFS — keep latest values accessible inside stable event listener ──────
  // This is the correct pattern for event listeners that need current state.
  // We use refs instead of re-registering the listener on every state change.
  const selectedFileRef = useRef(selectedFile);
  const selectedFileContentRef = useRef(selectedFileContent);

  useEffect(() => { selectedFileRef.current = selectedFile; }, [selectedFile]);
  useEffect(() => { selectedFileContentRef.current = selectedFileContent; }, [selectedFileContent]);

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const saveFile = useCallback(async () => {
    const file = selectedFileRef.current;
    const content = selectedFileContentRef.current;

    if (!file) return;

    setSaveStatus("saving");
    try {
      await axios.post(
        `${apiUrl}/code/save/${file._id}`,
        { code: content ?? "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus("saved");
      // Also update the repo array so the in-memory copy matches DB
      setRepo(prev =>
        prev.map(f => f._id === file._id ? { ...f, content: content ?? "" } : f)
      );
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      console.error("[CodeEditor] save failed:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }, [apiUrl, token]);

  // ── KEYBOARD LISTENER ─────────────────────────────────────────────────────
  // handleKeyDown reads from refs, so it never becomes stale.
  // It's created once and the useEffect has stable deps.
  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveFile();
    }
  }, [saveFile]);

  // Register listener — re-registers only if saveFile identity changes (rare).
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]); // ← correct: re-registers when handleKeyDown changes

  // ── CODE CHANGE ───────────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newValue) => {
    setSelectedFileContent(newValue);
    // Update in-memory repo state immediately so UI stays consistent
    setRepo(prev =>
      prev.map(f =>
        selectedFileRef.current && f._id === selectedFileRef.current._id
          ? { ...f, content: newValue }
          : f
      )
    );
  }, []);

  // ── FETCH REPO ────────────────────────────────────────────────────────────
  const fetchRepo = useCallback(() => {
    axios
      .get(`${apiUrl}/repo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setRepo(res.data))
      .catch(e => console.error("[CodeEditor] fetchRepo:", e));
  }, [apiUrl, id, token]);

  useEffect(() => {
    fetchRepo();
  }, [fetchRepo]);

  // ── RUN CODE ──────────────────────────────────────────────────────────────
  const [progress, setProgress] = useState(false);

  const handleRun = async () => {
    if (!selectedFileContentRef.current) return;
    setProgress(true);
    try {
      const result = await axios.post(
        `${apiUrl}/code/run`,
        { code: selectedFileContentRef.current, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(false);
      setExecResult({ result: result.data.output, error: false });
    } catch (e) {
      setProgress(false);
      setExecResult({ result: e.response?.data?.error || e.message, error: true });
    }
    setTerminal(true);
  };

  const closeTerminal = () => setTerminal(false);

  // ── FILE SELECTION ────────────────────────────────────────────────────────
  const handleFileSelection = useCallback((file) => {
    setSelectedFile(file);
    setLanguage(extensionMap[file.type] || "text");
    setSelectedFileContent(file.content ?? "");
    setSaveStatus("");
  }, []); // extensionMap is stable (object literal defined outside render)

  const toggleShareWindow = () => setShareWindow(prev => !prev);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      <TopBar
        props={{
          handleRun,
          toggleShareWindow,
          enableShare: true,
          saveFile,
          saveStatus,
          selectedFile,
        }}
      />
      <div className="flex border border-black bg-black text-white">
        {/* Sidebar toggle */}
        <div className="h-[86vh] w-[3vw] bg-gray-700 transition-all duration-300">
          <div
            className="cursor-pointer p-2 bg-gray-600 hover:bg-gray-500"
            onClick={() => {
              setFileBar(prev => !prev);
              setEditorWidth("100%");
            }}
          >
            <File />
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
        <div className={`h-[86vh] ${fileBar ? "w-[85vw]" : "w-[95vw]"} bg-gray-800 relative`}>
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
              Open a file from the sidebar to start editing
            </div>
          )}

          {shareWindow && (
            <ShareWindow props={{ toggleShareWindow, id }} />
          )}
          {terminal && (
            <Terminal props={{ terminal, closeTerminal, execResult, progress }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;