import fileModel from "../models/fileModel.js";
import repoModel from "../models/repositoryModel.js";

const createNewFile = async (req, res) => {
  const { name, parent, type } = req.body;
  if (!name || !parent || !type) {
    return res.status(400).json({ message: "name, parent, and type are required" });
  }
  try {
    const repo = await repoModel.findById(parent);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const file = await fileModel.create({ name, parent, type, content: "" });
    repo.files.push(file._id);
    await repo.save();

    return res.status(200).json({ message: "File created", file });
  } catch (e) {
    console.error("[fileController] createNewFile:", e);
    res.status(500).json({ message: "Internal error" });
  }
};

// Rename a file — updates name and derives new extension
const renameFile = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "New file name is required" });
  }
  try {
    const file = await fileModel.findById(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const parts = name.trim().split(".");
    const newType = parts.length > 1 ? parts[parts.length - 1] : file.type;

    file.name = name.trim();
    file.type = newType;
    await file.save();

    return res.status(200).json({ message: "File renamed", file });
  } catch (e) {
    console.error("[fileController] renameFile:", e);
    res.status(500).json({ message: "Internal error" });
  }
};

export default { createNewFile, renameFile };