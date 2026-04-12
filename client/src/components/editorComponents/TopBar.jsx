import React from "react";
import { Button } from "@mui/material";

/**
 * TopBar — updated to accept saveFile, saveStatus, and selectedFile props.
 *
 * saveStatus: "" | "saving" | "saved" | "error"
 * selectedFile: the currently open file (null if none)
 *
 * The Save button is disabled when no file is open or a save is in progress.
 * The status label shows brief feedback after saving.
 */
const TopBar = ({ props }) => {
  const {
    handleRun,
    toggleShareWindow,
    enableShare,
    saveFile,
    saveStatus,
    selectedFile,
  } = props;

  const saveLabel =
    saveStatus === "saving" ? "Saving…"
      : saveStatus === "saved" ? "Saved ✓"
        : saveStatus === "error" ? "Save failed ✗"
          : "Save";

  const saveBtnColor =
    saveStatus === "saved" ? "#16a34a"
      : saveStatus === "error" ? "#c0392b"
        : undefined;

  return (
    <div
      className="bg-gray-950 text-white h-[5vh] flex justify-end gap-2 items-center px-3"
      style={{ borderBottom: "1px solid #333" }}
    >
      {/* Save — always visible; disabled if no file selected */}
      {saveFile && (
        <Button
          variant="outlined"
          size="small"
          disabled={!selectedFile || saveStatus === "saving"}
          onClick={saveFile}
          title="Save file (Ctrl+S)"
          style={{
            color: saveBtnColor || undefined,
            borderColor: saveBtnColor || undefined,
            fontSize: 12,
            height: "3.2vh",
            textTransform: "none",
            minWidth: 70,
          }}
        >
          {saveLabel}
        </Button>
      )}

      {/* Run */}
      <Button
        variant="outlined"
        size="small"
        onClick={handleRun}
        disabled={!selectedFile}
        className="border border-gray-500 h-[4vh]"
        style={{ textTransform: "none" }}
      >
        Run
      </Button>

      {/* Share — only in CodeEditor, not SharingWindow */}
      {enableShare && (
        <Button
          variant="outlined"
          size="small"
          onClick={toggleShareWindow}
          className="border border-gray-500"
          style={{ textTransform: "none" }}
        >
          Share
        </Button>
      )}
    </div>
  );
};

export default TopBar;