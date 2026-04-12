import React from "react";
import { Box, IconButton, Divider, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Meeting-room Terminal — mirrors editorComponents/Terminal fix:
// Uses <pre> so \n newlines are always honoured in Java/Python output.
const Terminal = ({ props }) => {
  const { closeTerminal, execResult, progress } = props;
  const theme = useTheme();

  const isError = execResult?.error;
  const result  = execResult?.result ?? "";

  return (
    <Box sx={{
      position: "fixed",
      bottom: 0, left: 0,
      width: "40vw", height: "28vh",
      bgcolor: "#0d0d0d", color: "#fff",
      zIndex: 10, px: 2, py: 1,
      borderTop: `1px solid ${theme.palette.grey[700]}`,
      display: "flex", flexDirection: "column",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 10, height: 10, borderRadius: "50%",
            bgcolor: progress ? "#f59e0b" : isError ? "#ef4444" : "#22c55e",
          }} />
          <Box component="span" sx={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>
            Terminal {progress ? "— running…" : isError ? "— error" : "— done"}
          </Box>
        </Box>
        <IconButton onClick={closeTerminal} size="small" sx={{ color: "#555", "&:hover": { color: "#fff" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ bgcolor: "#222", mb: 1 }} />

      <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
        {progress ? (
          <Box component="pre" sx={{
            m: 0, fontFamily: "monospace", fontSize: 13,
            color: "#f59e0b", fontStyle: "italic",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>Running…</Box>
        ) : (
          <Box component="pre" sx={{
            m: 0, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            color: isError ? "#f87171" : "#86efac",
          }}>
            {result || "(no output)"}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Terminal;
