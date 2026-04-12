import express from "express";
import { chatStream } from "../controllers/chatController.js";

const router = express.Router();

// ✅ SSE streaming route
router.post("/stream", (req, res) => {
  chatStream(req, res);
});

export default router;