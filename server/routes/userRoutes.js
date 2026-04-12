import express from "express";
import userController from "../controllers/userController.js";
import validateToken from "../middleware/tokenValidation.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get("/getUser", userController.getUser);
router.post("/verify-email", userController.verifyEmail);
router.post("/resend-otp", userController.resendOtp);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// ── Connections (invitation-based, one-time per pair) ───────────────────────
router.post("/connect", validateToken, userController.addTeamMate);
router.post("/add-teammate", validateToken, userController.addTeamMate);   // alias
router.get("/connections", validateToken, userController.getConnections);
router.delete("/connections/:connectionId", validateToken, userController.removeConnection);
router.get("/getInvitations", validateToken, userController.getUserInvitations);
router.post("/invitations/accept", validateToken, userController.acceptInvite);
router.post("/invitations/decline", validateToken, userController.declineInvite);

// ── Teams (groups of connections, multiple per user) ────────────────────────
router.get("/getTeammates", validateToken, userController.getTeammates);
router.post("/team/create", validateToken, userController.createTeam);
router.put("/team/:teamId/rename", validateToken, userController.updateTeamName);
router.delete("/team/:teamId", validateToken, userController.deleteTeam);
router.delete("/team/:teamId/member", validateToken, userController.removeMember);
router.post("/team/:teamId/leave", validateToken, userController.leaveTeam);
router.post("/team/:teamId/add-member", validateToken, userController.addMemberToTeam);

// ── Meeting ─────────────────────────────────────────────────────────────────
router.post("/send-meeting-invite", validateToken, userController.sendMeetingInvite);

export default router;