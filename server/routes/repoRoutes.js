import express from "express";
import repoController from "../controllers/repoController.js";
import validateToken from "../middleware/tokenValidation.js";
const router = express.Router();

router.get("/getSharedRepos",validateToken,repoController.getSharedRepos);
router.get("/",validateToken,repoController.getAllRepos);
router.get("/:id",validateToken,repoController.getRepoById);
router.post("/new",validateToken,repoController.createNewRepo);
router.post("/share/:id",validateToken,repoController.shareRepo);
export default router;