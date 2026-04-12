import express from 'express';
import codeController from "../controllers/codeController.js";
import jDoodle from "../controllers/jDoodle.js";
const router = express.Router();

router.post("/run",codeController.runCode)
router.post("/save/:id",codeController.saveCode);
export default router;