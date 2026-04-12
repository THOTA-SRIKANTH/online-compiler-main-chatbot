import React, { useContext, useState } from "react";
import axios from "axios";
import FileIcons from "./FileIcons";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AppContext from "../../context/Context";

// Language boilerplate shown when a new (empty) file is opened
const BOILERPLATE = {
  python:     `# Python script\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n`,
  javascript: `// JavaScript\n\nfunction main() {\n    console.log("Hello, World!");\n}\n\nmain();\n`,
  c:          `// C program\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n`,
  cpp:        `// C++ program\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
  text:       "",
  // Java boilerplate is generated dynamically using the file's base name as the class name
};

/**
 * Generate Java boilerplate where the class name matches the file name.
 * File: "HelloWorld.java" → class HelloWorld { ... }
 * This ensures javac can find and compile the file correctly.
 */
const javaBoilerplate = (baseName) => {
  // Capitalise first letter, strip non-identifier chars for safety
  const className = baseName
    .replace(/[^a-zA-Z0-9_$]/g, "")
    .replace(/^[0-9]/, "_$&") || "Main";
  const cap = className.charAt(0).toUpperCase() + className.slice(1);
  return `// Java program — class name matches file name for javac compatibility\npublic class ${cap} {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`;
};

const extensionToLang = {
  py: "python",
  java: "java",
  js: "javascript",
  c: "c",
  cpp: "cpp",
  txt: "text",
};

const FileBar = ({ props }) => {
  const {
    selectedFile,
    setSelectedFileFn,
    setSelectedFileContent,
    id,
    repo,
    fetchRepo,
    setLanguage,
    extensionMap,
    handleFileSelection,
  } = props;

  const [fileName, setFileName] = useState("");
  const [newFileWindow, setNewFileWindow] = useState(false);
  const [renameWindow, setRenameWindow] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null); // file being renamed
  const [renameValue, setRenameValue] = useState("");
  const [hovered, setHovered] = useState(null); // file._id of hovered row

  const { apiUrl } = useContext(AppContext);
  const token = localStorage.getItem("token");

  // ── CREATE FILE ──────────────────────────────────────────────────────────
  const [fileNameError, setFileNameError] = useState("");

  const validateFileName = (name) => {
    if (!name.trim()) return "File name is required";
    const parts = name.trim().split(".");
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    if (ext === "java") {
      // For Java: the base name must be a valid Java identifier
      const base = parts.slice(0, -1).join(".");
      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(base)) {
        return "Java file names must be valid identifiers (e.g. HelloWorld.java)";
      }
    }
    return "";
  };

  const addFile = async () => {
    const trimmed = fileName.trim();
    if (!trimmed) return;
    const err = validateFileName(trimmed);
    if (err) { setFileNameError(err); return; }

    const parts = trimmed.split(".");
    const fileExtension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "txt";

    // For Java: auto-capitalise the file name to match Java convention
    let finalName = trimmed;
    if (fileExtension === "java") {
      const base = parts.slice(0, -1).join(".");
      const cap = base.charAt(0).toUpperCase() + base.slice(1);
      finalName = `${cap}.java`;
    }

    try {
      const res = await axios.post(
        `${apiUrl}/file/new`,
        { name: finalName, parent: id, type: fileExtension },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) fetchRepo();
    } catch (e) {
      console.error("Error creating file:", e);
    }
    setNewFileWindow(false);
    setFileName("");
    setFileNameError("");
  };

  // ── RENAME FILE ──────────────────────────────────────────────────────────
  const openRename = (e, file) => {
    e.stopPropagation(); // don't trigger file selection
    setRenameTarget(file);
    setRenameValue(file.name);
    setRenameWindow(true);
  };

  const doRename = async () => {
    if (!renameValue.trim() || !renameTarget) return;
    try {
      const res = await axios.put(
        `${apiUrl}/file/rename/${renameTarget._id}`,
        { name: renameValue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        fetchRepo();
        // If this file is currently open, update the editor header
        if (selectedFile?._id === renameTarget._id) {
          setSelectedFileFn({ ...selectedFile, name: renameValue.trim() });
        }
      }
    } catch (e) {
      console.error("Error renaming file:", e);
    }
    setRenameWindow(false);
    setRenameTarget(null);
    setRenameValue("");
  };

  // ── FILE CLICK — populate editor with content or boilerplate ────────────
  const handleFileClick = (file) => {
    const lang = extensionMap?.[file.type] || extensionToLang[file.type] || "text";
    let content = file.content?.trim() ? file.content : "";
    if (!content) {
      if (lang === "java") {
        // Generate boilerplate using the file's base name as the class name
        const base = file.name.replace(/\.java$/i, "");
        content = javaBoilerplate(base);
      } else {
        content = BOILERPLATE[lang] ?? "";
      }
    } else if (lang === "java") {
      // If file has content but class name doesn't match file name, leave it —
      // codeController extracts the actual class name via regex anyway.
    }
    handleFileSelection({ ...file, content });
  };

  return (
    <div>
      {repo && (
        <Box className="w-[15vw] flex flex-col h-[80vh] overflow-y-auto">
          {/* Header row */}
          <Box className="flex justify-between items-center p-[1vw] bg-gray-100 dark:bg-gray-800">
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              Files
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); setNewFileWindow(true); }}
            >
              + Add
            </Button>
          </Box>

          {/* File list */}
          {repo.map((file) => (
            <Box
              key={file._id}
              onClick={() => handleFileClick(file)}
              onMouseEnter={() => setHovered(file._id)}
              onMouseLeave={() => setHovered(null)}
              className={`p-2 border-b flex items-center justify-between cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition ${selectedFile?._id === file._id ? "bg-gray-400 dark:bg-gray-600" : ""
                }`}
              style={{ gap: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
                <FileIcons extension={`.${file.type}`} />
                <Typography noWrap style={{ fontSize: 13 }}>{file.name}</Typography>
              </div>

              {/* Rename button — visible on hover */}
              {hovered === file._id && (
                <Tooltip title="Rename" placement="right">
                  <IconButton
                    size="small"
                    onClick={(e) => openRename(e, file)}
                    style={{ padding: 2, flexShrink: 0 }}
                  >
                    <EditIcon style={{ fontSize: 14, color: "#aaa" }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}

          {/* Create File Dialog */}
          <Dialog open={newFileWindow} onClose={() => { setNewFileWindow(false); setFileName(""); setFileNameError(""); }}>
            <DialogTitle>Create New File</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus fullWidth margin="dense"
                label="File name (with extension)"
                value={fileName}
                onChange={(e) => { setFileName(e.target.value); setFileNameError(""); }}
                placeholder="e.g. HelloWorld.java or script.py"
                onKeyDown={(e) => e.key === "Enter" && addFile()}
                error={!!fileNameError}
                helperText={fileNameError || (
                  fileName.toLowerCase().endsWith(".java")
                    ? "Java tip: class name must match file name. e.g. HelloWorld.java → public class HelloWorld"
                    : "Supported: .java .py .js .c .cpp .txt"
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setNewFileWindow(false); setFileName(""); }} color="secondary">
                Cancel
              </Button>
              <Button onClick={addFile} variant="contained" disabled={!fileName.trim()}>
                Create
              </Button>
            </DialogActions>
          </Dialog>

          {/* Rename File Dialog */}
          <Dialog open={renameWindow} onClose={() => { setRenameWindow(false); setRenameTarget(null); }}>
            <DialogTitle>Rename File</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                margin="dense"
                label="New file name (with extension)"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="newname.py"
                onKeyDown={(e) => e.key === "Enter" && doRename()}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setRenameWindow(false); setRenameTarget(null); }} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={doRename}
                variant="contained"
                disabled={!renameValue.trim() || renameValue.trim() === renameTarget?.name}
              >
                Rename
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </div>
  );
};

export default FileBar;