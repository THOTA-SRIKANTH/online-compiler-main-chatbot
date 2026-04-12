import React, { useState, useRef, useCallback } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Terminal — resizable output panel (drag from any edge or corner).
 * Uses <pre> so \n from Java println / Python print renders correctly.
 */
const MIN_W = 240, MIN_H = 80, MAX_W = window.innerWidth * 0.85, MAX_H = 700;

const Terminal = ({ props }) => {
  const { closeTerminal, execResult, progress } = props;
  const theme = useTheme();

  const isError = execResult?.error;
  const result  = execResult?.result ?? "";

  const [size, setSize] = useState({ w: window.innerWidth * 0.4, h: 200 });
  const dragRef  = useRef(null);  // which edges are being dragged
  const startRef = useRef({});

  // Unified drag start
  const startResize = useCallback((edges) => (e) => {
    e.preventDefault();
    dragRef.current  = edges;   // { top, bottom, left, right }
    startRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;
      const { top, bottom, right } = dragRef.current;

      setSize(prev => {
        const newH = bottom ? Math.max(MIN_H, Math.min(MAX_H, startRef.current.h + dy))
                   : top    ? Math.max(MIN_H, Math.min(MAX_H, startRef.current.h - dy))
                   : prev.h;
        const newW = right ? Math.max(MIN_W, Math.min(MAX_W, startRef.current.w + dx))
                   : prev.w;
        return { w: newW, h: newH };
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [size.w, size.h]);

  const handle = (edges, style) => (
    <div
      onMouseDown={startResize(edges)}
      style={{
        position: "absolute", zIndex: 20,
        cursor: edges.top && edges.right ? "ne-resize"
               : edges.top              ? "n-resize"
               : edges.right            ? "e-resize"
               : edges.bottom && edges.right ? "se-resize"
               : edges.bottom           ? "s-resize"
               : "ew-resize",
        ...style,
      }}
    />
  );

  return (
    <Box sx={{
      position: "fixed", bottom: 0, left: 0,
      width:  `${size.w}px`,
      height: `${size.h}px`,
      bgcolor: "#0d0d0d", color: "#fff", zIndex: 10,
      display: "flex", flexDirection: "column",
      borderTop: `1px solid ${theme.palette.grey[700]}`,
      borderRight: "1px solid #2a2a2a",
      boxShadow: "4px -4px 24px rgba(0,0,0,0.5)",
      userSelect: dragRef.current ? "none" : "auto",
    }}>
      {/* ── Resize handles ── */}
      {handle({ top: true },                    { top: 0, left: 4, right: 4, height: 5 })}
      {handle({ right: true },                  { top: 4, right: 0, bottom: 4, width: 5 })}
      {handle({ top: true, right: true },        { top: 0, right: 0, width: 10, height: 10 })}

      {/* ── Grip indicator ── */}
      <Box sx={{ position: "absolute", top: 1, left: "50%", transform: "translateX(-50%)", width: 36, height: 3, borderRadius: 2, bgcolor: "#3a3a3a", zIndex: 21, pointerEvents: "none" }} />

      {/* ── Header ── */}
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        px: 2, pt: "10px", pb: "6px",
        bgcolor: "#1a1a1a", borderBottom: "1px solid #333", flexShrink: 0,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <Box key={c} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c }} />
          ))}
          <Box component="span" sx={{ ml: 1, fontFamily: "monospace", fontSize: 11, color: "#555" }}>
            {progress ? "running…" : isError ? "error" : "output"}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {[["S", 80], ["M", 200], ["L", 360]].map(([label, h]) => (
            <Box key={label} component="button" onClick={() => setSize(s => ({ ...s, h }))}
              sx={{
                background: size.h === h ? "#2a2a2a" : "none",
                border: "1px solid #333", borderRadius: "3px",
                cursor: "pointer", color: size.h === h ? "#ccc" : "#555",
                px: "7px", py: "1px", fontSize: 10, lineHeight: 1.4,
                "&:hover": { color: "#ccc", borderColor: "#555" },
              }}>
              {label}
            </Box>
          ))}
          <IconButton onClick={closeTerminal} size="small" sx={{ color: "#555", p: 0.5, ml: 0.5 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Output ── */}
      <Box sx={{ flex: 1, overflowY: "auto", p: "10px 14px" }}>
        <pre style={{
          margin: 0,
          fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
          fontSize: 13, lineHeight: 1.6,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          color: progress ? "#888" : isError ? "#f87171" : "#86efac",
        }}>
          {progress ? "Running…" : (result || (isError ? "(no error output)" : "(no output)"))}
        </pre>
      </Box>
    </Box>
  );
};

export default Terminal;
