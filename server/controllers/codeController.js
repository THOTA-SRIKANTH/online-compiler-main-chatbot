import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fileModel from "../models/fileModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Ensure codes/ temp directory always exists ────────────────────────────────
const codesDir = path.join(__dirname, "codes");
if (!fs.existsSync(codesDir)) {
  fs.mkdirSync(codesDir, { recursive: true });
}

// ── Detect Python binary once at startup ──────────────────────────────────────
// On Linux `python` is often missing; `python3` is the correct binary.
let PYTHON_BIN = "python3";
try {
  execSync("python3 --version", { stdio: "ignore" });
  PYTHON_BIN = "python3";
} catch {
  try {
    execSync("python --version", { stdio: "ignore" });
    PYTHON_BIN = "python";
  } catch {
    PYTHON_BIN = "python3"; // fallback — will emit a clear error at runtime
  }
}
console.log(`[CodeRunner] Using Python binary: ${PYTHON_BIN}`);

// ── Helper: run a shell command then clean up temp files ──────────────────────
function runWithCleanup(filePaths, command, res, opts = {}) {
  exec(command, { timeout: 15000, ...opts }, (error, stdout, stderr) => {
    // Always delete temp files regardless of success or failure
    (Array.isArray(filePaths) ? filePaths : [filePaths]).forEach((f) => {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
    });

    if (error) {
      // Since we use 2>&1 in commands, Python/compiler errors land in stdout, not stderr.
      // Return whichever has the actual error message.
      const errorOutput = stdout || stderr || error.message;
      return res.status(500).json({ error: errorOutput });
    }
    return res.json({ output: stdout || "(no output)" });
  });
}

// ── Main run-code handler ─────────────────────────────────────────────────────
export const runCode = async (req, res) => {
  const { code, language } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "No code provided." });
  }

  switch (language) {

    // ── PYTHON ─────────────────────────────────────────────────────────────
    case "python": {
      const filePath = path.join(codesDir, `temp_${Date.now()}.py`);
      try {
        fs.writeFileSync(filePath, code, "utf8");
      } catch (err) {
        return res.status(500).json({ error: `Could not write file: ${err.message}` });
      }
      const command = `${PYTHON_BIN} "${filePath}" 2>&1`;
      runWithCleanup([filePath], command, res);
      break;
    }

    // ── JAVASCRIPT (Node.js) ───────────────────────────────────────────────
    case "javascript": {
      const filePath = path.join(codesDir, `temp_${Date.now()}.js`);
      try {
        fs.writeFileSync(filePath, code, "utf8");
      } catch (err) {
        return res.status(500).json({ error: `Could not write file: ${err.message}` });
      }
      const command = `node "${filePath}" 2>&1`;
      runWithCleanup([filePath], command, res);
      break;
    }

    // ── JAVA ───────────────────────────────────────────────────────────────
    case "java": {
      // Extract the public class name so ANY class name works (not just "Temp")
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : "Main";
      const filePath = path.join(codesDir, `${className}.java`);
      const classFile = path.join(codesDir, `${className}.class`);
      try {
        fs.writeFileSync(filePath, code, "utf8");
      } catch (err) {
        return res.status(500).json({ error: `Could not write file: ${err.message}` });
      }
      // Must run from codesDir so javac finds the source and writes .class there
      const command = `javac ${className}.java && java ${className} 2>&1`;
      runWithCleanup([filePath, classFile], command, res, { cwd: codesDir, timeout: 20000 });
      break;
    }

    // ── C ──────────────────────────────────────────────────────────────────
    case "c": {
      const ts = Date.now();
      const srcPath = path.join(codesDir, `temp_${ts}.c`);
      const exePath = path.join(codesDir, `temp_${ts}`);
      try {
        fs.writeFileSync(srcPath, code, "utf8");
      } catch (err) {
        return res.status(500).json({ error: `Could not write file: ${err.message}` });
      }
      const command = `gcc "${srcPath}" -o "${exePath}" -lm && "${exePath}" 2>&1`;
      runWithCleanup([srcPath, exePath], command, res);
      break;
    }

    // ── C++ ────────────────────────────────────────────────────────────────
    case "cpp": {
      const ts = Date.now();
      const srcPath = path.join(codesDir, `temp_${ts}.cpp`);
      const exePath = path.join(codesDir, `temp_${ts}`);
      try {
        fs.writeFileSync(srcPath, code, "utf8");
      } catch (err) {
        return res.status(500).json({ error: `Could not write file: ${err.message}` });
      }
      const command = `g++ "${srcPath}" -o "${exePath}" -lm && "${exePath}" 2>&1`;
      runWithCleanup([srcPath, exePath], command, res);
      break;
    }

    default: {
      return res.status(400).json({ error: `Language "${language}" is not supported.` });
    }
  }
};

// ── Save code to file in DB ───────────────────────────────────────────────────
export const saveCode = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  try {
    const file = await fileModel.findById(id);
    if (!file) return res.status(404).json({ error: "File not found" });
    file.content = code;
    await file.save();
    return res.status(200).send("File saved successfully");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export default { runCode, saveCode };