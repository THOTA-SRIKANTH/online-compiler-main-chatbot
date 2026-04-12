import React, { useContext, useState, useCallback, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";
import MonacoEditor from "react-monaco-editor";
import axios from "axios";
import AppContext from "../../context/Context";

/**
 * Editor.jsx (meeting) — fixed version.
 *
 * Fixes:
 *  1. socket.emit codeChange now uses correct payload shape `{ code, id }`
 *  2. Language selector synced with parent `language` prop
 *  3. Terminal result displayed properly with scroll
 *  4. Resize handle for panel width
 *  5. Prevent emitting when code unchanged (debounce-like guard)
 */
// ── Default starter programs per language ─────────────────────────────────
const DEFAULT_PROGRAMS = {
  python:
`# Python - Hello World
print("Hello, World!")

# Try something more:
name = "Developer"
print(f"Welcome, {name}!")
`,
  javascript:
`// JavaScript - Hello World
console.log("Hello, World!");

// Try something more:
const name = "Developer";
console.log(\`Welcome, \${name}!\`);
`,
  java:
`// Java - Hello World
// You can use any class name — the file will be named to match automatically
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        String name = "Developer";
        System.out.println("Welcome, " + name + "!");
    }
}
`,
  c:
`// C - Hello World
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");

    // Try something more:
    char name[] = "Developer";
    printf("Welcome, %s!\\n", name);
    return 0;
}
`,
  cpp:
`// C++ - Hello World
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    // Try something more:
    string name = "Developer";
    cout << "Welcome, " << name << "!" << endl;
    return 0;
}
`,
};

const Editor = ({ socket, id, closeEditor, code, changeCode, language, changeLanguage }) => {
  const { apiUrl } = useContext(AppContext);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [compiling, setCompiling]       = useState(false);
  const [result, setResult]             = useState("");
  const [hasError, setHasError]         = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200); // px — resizable
  const lastEmittedCode = useRef(code);
  const mountedRef      = useRef(false);
  const resizingRef     = useRef(false);
  const startYRef       = useRef(0);
  const startHRef       = useRef(0);

  // ── Terminal drag-to-resize ────────────────────────────────────────────────
  const onResizeMouseDown = (e) => {
    e.preventDefault();
    resizingRef.current = true;
    startYRef.current   = e.clientY;
    startHRef.current   = terminalHeight;

    const onMove = (ev) => {
      if (!resizingRef.current) return;
      const delta = startYRef.current - ev.clientY;   // drag UP = bigger terminal
      const newH  = Math.max(80, Math.min(600, startHRef.current + delta));
      setTerminalHeight(newH);
    };
    const onUp = () => {
      resizingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // On first open: seed the default program ONLY if the editor is truly empty.
  // IMPORTANT: if the Meeting passed in existing code (from the first person's
  // session via existing-users), `code` will already be non-empty here — we
  // must NOT overwrite it with a default program.
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (!code || !code.trim()) {
      const defaultCode = DEFAULT_PROGRAMS[language] || "";
      if (defaultCode) {
        changeCode(defaultCode);
        lastEmittedCode.current = defaultCode;
        socket?.emit("codeChange", { code: defaultCode, id });
      }
    } else {
      // Sync lastEmittedCode with the code we received so the first local
      // keystroke doesn't trigger a spurious "unchanged" emit guard bypass
      lastEmittedCode.current = code;
    }
  }, []); // eslint-disable-line

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    changeLanguage(lang);
    socket?.emit("change-language", { language: lang, id });
    // Always load the default starter program when switching language
    const defaultCode = DEFAULT_PROGRAMS[lang] || "";
    changeCode(defaultCode);
    lastEmittedCode.current = defaultCode;
    socket?.emit("codeChange", { code: defaultCode, id });
  };

  const handleCodeChange = useCallback((newValue) => {
    changeCode(newValue);
    // Only emit if changed (avoids flooding on cursor moves)
    if (newValue !== lastEmittedCode.current) {
      lastEmittedCode.current = newValue;
      socket?.emit("codeChange", { code: newValue, id });
    }
  }, [socket, id, changeCode]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setResult("");
    setHasError(false);
    setCompiling(true);
    setTerminalOpen(true);
    try {
      const res = await axios.post(`${apiUrl}/code/run`, { code, language });
      setResult(res.data.output || "(no output)");
      setHasError(false);
    } catch (err) {
      setResult(err.response?.data?.error || err.message || "Unknown error");
      setHasError(true);
    } finally {
      setCompiling(false);
    }
  };

  const LANGUAGES = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
  ];

  return (
    <div style={{
      width: "40vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1e1e1e",
      borderRight: "1px solid #333",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px",
        backgroundColor: "#252526",
        borderBottom: "1px solid #3c3c3c",
        flexShrink: 0,
      }}>
        <select
          value={language}
          onChange={handleLanguageChange}
          style={{
            backgroundColor: "#3c3c3c", color: "#ccc",
            border: "1px solid #555", borderRadius: 6,
            padding: "4px 8px", fontSize: 13, cursor: "pointer",
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <button
          onClick={handleRunCode}
          disabled={compiling}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 6,
            backgroundColor: compiling ? "#2d5a2d" : "#3c8c3c",
            color: "#fff", border: "none",
            cursor: compiling ? "default" : "pointer",
            fontSize: 13, fontWeight: 500,
          }}
        >
          <Play size={14} />
          {compiling ? "Running…" : "Run"}
        </button>

        <div style={{ flex: 1 }} />

        <span style={{ color: "#888", fontSize: 12 }}>
          Collaborative editor
        </span>

        <button
          onClick={closeEditor}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#888", display: "flex", padding: 4, borderRadius: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <MonacoEditor
          height="100%"
          width="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            selectOnLineNumbers: true,
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "line",
            cursorBlinking: "blink",
          }}
        />
      </div>

      {/* ── Resizable Terminal ── */}
      {terminalOpen && (
        <div style={{
          height: terminalHeight, flexShrink: 0, position: "relative",
          backgroundColor: "#0d0d0d", borderTop: "1px solid #333",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Drag handle */}
          <div onMouseDown={onResizeMouseDown} style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 6,
            cursor: "ns-resize", zIndex: 10,
          }}>
            <div style={{ position: "absolute", top: 1, left: "50%", transform: "translateX(-50%)", width: 36, height: 3, borderRadius: 2, backgroundColor: "#3a3a3a" }} />
          </div>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px 6px", backgroundColor: "#1a1a1a", borderBottom: "1px solid #222", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {["#ff5f57","#febc2e","#28c840"].map(c => (
                <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: c }} />
              ))}
              <span style={{ color: "#555", fontSize: 11, fontFamily: "monospace", marginLeft: 6 }}>
                terminal {compiling ? "— running…" : hasError ? "— error" : "— done"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[["S",100],["M",200],["L",360]].map(([label,h]) => (
                <button key={label} onClick={() => setTerminalHeight(h)} title={`${h}px`}
                  style={{ background: terminalHeight === h ? "#2a2a2a" : "none", border: "1px solid #333", borderRadius: 3, cursor: "pointer", color: terminalHeight === h ? "#ccc" : "#555", padding: "1px 7px", fontSize: 10 }}>
                  {label}
                </button>
              ))}
              <button onClick={() => setTerminalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: 2, display: "flex", marginLeft: 4 }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Output */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
            <pre style={{
              margin: 0,
              fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
              fontSize: 13, lineHeight: 1.6,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
              color: compiling ? "#888" : hasError ? "#f87171" : "#86efac",
            }}>
              {compiling ? "Running…" : result || "(no output)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;