import fileModel from "../models/fileModel.js";
import repoModel from "../models/repositoryModel.js";
import userModel from "../models/userModel.js";

// ── GET REPO BY ID ──────────────────────────────────────────────────────────
// Returns all files belonging to the repo, including their content.
// Previously this worked correctly — files are stored with their content
// field in MongoDB and fileModel.find({ parent: id }) retrieves them all.
// The content field is populated as long as it was saved via /code/save/:id.
const getRepoById = async (req, res) => {
  const { id } = req.params;
  try {
    // Explicitly select all fields including content to ensure nothing is excluded
    const files = await fileModel.find({ parent: id }).select("name type content parent createdAt updatedAt");
    res.status(200).json(files);
  } catch (error) {
    console.error("[repoController] getRepoById:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── CREATE NEW REPO ──────────────────────────────────────────────────────────
export const createNewRepo = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Repository name is required" });

  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newRepo = await repoModel.create({
      name,
      files: [],
      createdBy: req.user.id,
    });

    user.repos.push(newRepo._id);
    await user.save();

    res.status(200).json({ message: "New repository created", repo: newRepo });
  } catch (e) {
    console.error("[repoController] createNewRepo:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET ALL REPOS ────────────────────────────────────────────────────────────
export const getAllRepos = async (req, res) => {
  try {
    const repos = await repoModel.find({ createdBy: req.user.id });
    res.status(200).json(repos);
  } catch (e) {
    console.error("[repoController] getAllRepos:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── SHARE REPO ───────────────────────────────────────────────────────────────
// Shares a repo with a list of teammate emails.
// Only the repo creator can share it.
export const shareRepo = async (req, res) => {
  const { team } = req.body;  // array of email strings
  const { id } = req.params;

  if (!Array.isArray(team) || team.length === 0) {
    return res.status(400).json({ message: "No teammates selected" });
  }

  try {
    const repo = await repoModel.findById(id);
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // Verify the requester owns this repo
    if (repo.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You do not own this repository" });
    }

    const results = [];
    for (const email of team) {
      const recipient = await userModel.findOne({ email });
      if (!recipient) {
        results.push({ email, status: "not found" });
        continue;
      }

      // Avoid duplicate entries in sharedRepos
      const alreadyShared = recipient.sharedRepos
        .map(r => r.toString())
        .includes(id.toString());

      if (!alreadyShared) {
        recipient.sharedRepos.push(id);
        await recipient.save();
      }

      results.push({ email, status: "shared" });
    }

    // Track who it was shared with (avoid duplicates)
    const newEmails = team.filter(e => !repo.sharedBy.includes(e));
    if (newEmails.length > 0) {
      repo.sharedBy = repo.sharedBy.concat(newEmails);
      await repo.save();
    }

    res.status(200).json({ message: "Shared successfully", results });
  } catch (error) {
    console.error("[repoController] shareRepo:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET SHARED REPOS ─────────────────────────────────────────────────────────
const getSharedRepos = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Populate the owner (createdBy) so the UI can show "Shared by X"
    const sharedRepos = await repoModel
      .find({ _id: { $in: user.sharedRepos } })
      .populate("createdBy", "name email")   // ← include owner name + email
      .lean();

    res.json({ sharedRepos });
  } catch (e) {
    console.error("[repoController] getSharedRepos:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default { getRepoById, createNewRepo, getAllRepos, shareRepo, getSharedRepos };