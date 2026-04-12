import express from 'express';
const router = express.Router();
import fileController from "../controllers/fileController.js";
import validateToken from '../middleware/tokenValidation.js';

router.post("/new", validateToken, fileController.createNewFile);
router.put("/rename/:id", validateToken, fileController.renameFile);

export default router;