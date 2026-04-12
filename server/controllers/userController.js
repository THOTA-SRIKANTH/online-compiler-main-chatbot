import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import Invitation from "../models/invitationModel.js";
import Team from "../models/teammateModel.js";
import otpGenerator from "otp-generator";
import sendMail from '../services/mailer.js';

const generateOtp = () =>
    otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

// ── AUTH ──────────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Invalid email format" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters long" });
    try {
        const userExists = await userModel.findOne({ email });
        if (userExists?.isVerified) return res.status(400).json({ message: 'User already exists' });
        const otp = generateOtp();
        if (userExists && !userExists.isVerified) {
            if (userExists.verificationCodeExpiry > Date.now())
                return res.status(400).json({ message: "OTP already sent. Please wait before requesting again", expiresIn: Math.floor((userExists.verificationCodeExpiry - Date.now()) / 1000) });
            userExists.verificationCode = otp;
            userExists.verificationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
            await userExists.save();
            await sendMail(email, "OTP for CodeMeet", `Your OTP is: ${otp}`);
            return res.status(200).json({ message: "OTP resent", expiresIn: 300 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ name, email, password: hashedPassword, repos: [], verificationCode: otp, verificationCodeExpiry: new Date(Date.now() + 5 * 60 * 1000), isVerified: false });
        await sendMail(email, "OTP for CodeMeet", `Your OTP is: ${otp}`);
        return res.status(201).json({ message: "User created, OTP sent", expiresIn: 300 });
    } catch (err) { console.error("registerUser:", err); res.status(500).json({ message: 'Server error' }); }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        if (!user.isVerified) return res.status(401).json({ message: "Please verify your email before logging in." });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { email, name: user.name, id: user._id } });
    } catch { res.status(500).json({ message: 'Server error' }); }
};

const getUser = async (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token not found" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email });
        if (!user) return res.status(404).json("Invalid token");
        return res.status(200).json({ user: { name: user.name, email: user.email, id: user._id } });
    } catch { return res.status(400).json({ message: "Invalid signature" }); }
};

// ── INVITATIONS (teammate connection requests) ─────────────────────────────
const addTeamMate = async (req, res) => {
    const { email } = req.body;
    if (email === req.user.email) return res.status(400).json({ message: "Cannot send a request to yourself" });
    try {
        const sender = await userModel.findOne({ email: req.user.email });
        const receiver = await userModel.findOne({ email });
        if (!receiver) return res.status(404).json({ message: "User not found" });

        const existing = await Invitation.findOne({
            $or: [
                { sender: sender._id, receiver: receiver._id },
                { sender: receiver._id, receiver: sender._id }
            ]
        });
        if (existing) {
            if (existing.status === "pending") return res.status(400).json({ message: "Invitation already pending between you two" });
            if (existing.status === "accepted") return res.status(400).json({ message: "Already connected" });
            existing.status = "pending"; 
            existing.sender = sender._id;
            existing.senderName = sender.name;
            existing.senderEmail = sender.email;
            existing.receiver = receiver._id;
            existing.receiverEmail = receiver.email;
            await existing.save();
            return res.status(200).json({ message: "Invitation re-sent" });
        }
        await Invitation.create({ sender: sender._id, senderName: sender.name, senderEmail: sender.email, receiver: receiver._id, receiverEmail: receiver.email, status: "pending" });
        return res.status(200).json({ message: "Invitation sent" });
    } catch (err) { console.error("[addTeamMate]", err); return res.status(500).json({ message: "Server error" }); }
};

const getUserInvitations = async (req, res) => {
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });
        const invitations = await Invitation.find({
            $or: [
                { receiver: me._id },
                { sender: me._id, status: { $in: ["accepted", "rejected"] } }
            ]
        }).sort({ createdAt: -1 }).lean();
        
        // Map appropriately so frontend can display the OTHER person whether we are sender or receiver
        const formatted = invitations.map(inv => {
            const isSender = inv.sender.toString() === me._id.toString();
            return {
                _id: inv._id,
                // if we are sender, the "other person" is receiver. Frontend uses senderName/senderEmail 
                // to display the other person. So we swap it if we are the sender.
                senderName: isSender ? inv.receiverEmail.split('@')[0] : (inv.senderName || inv.senderEmail.split('@')[0]),
                senderEmail: isSender ? inv.receiverEmail : inv.senderEmail,
                status: inv.status,
                createdAt: inv.createdAt
            };
        });
        return res.status(200).json({ invitations: formatted });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
};

const acceptInvite = async (req, res) => {
    const { email, invitationId } = req.body;
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });
        let invitation;
        if (invitationId) invitation = await Invitation.findOne({ _id: invitationId, receiver: me._id });
        else if (email) { const s = await userModel.findOne({ email }); if (s) invitation = await Invitation.findOne({ sender: s._id, receiver: me._id, status: "pending" }); }
        if (!invitation) return res.status(404).json({ message: "Invitation not found" });
        if (invitation.status !== "pending") return res.status(400).json({ message: `Invitation already ${invitation.status}` });
        invitation.status = "accepted";
        await invitation.save();
        return res.status(200).json({ message: "Invitation accepted" });
    } catch (err) { console.error("[acceptInvite]", err); res.status(500).json({ message: "Server error" }); }
};

const declineInvite = async (req, res) => {
    const { email, invitationId } = req.body;
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });
        let invitation;
        if (invitationId) invitation = await Invitation.findOne({ _id: invitationId, receiver: me._id });
        else if (email) { const s = await userModel.findOne({ email }); if (s) invitation = await Invitation.findOne({ sender: s._id, receiver: me._id, status: "pending" }); }
        if (!invitation) return res.status(404).json({ message: "Invitation not found" });
        if (invitation.status !== "pending") return res.status(400).json({ message: `Invitation already ${invitation.status}` });
        invitation.status = "rejected"; await invitation.save();
        return res.status(200).json({ message: "Invitation declined" });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
};

const getConnections = async (req, res) => {
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });

        const connections = await Invitation.find({
            $or: [{ sender: me._id }, { receiver: me._id }],
            status: "accepted"
        }).populate("sender", "name email").populate("receiver", "name email").lean();

        const formattedMap = new Map();
        for (const inv of connections) {
            const isSender = inv.sender._id.toString() === me._id.toString();
            const otherUser = isSender ? inv.receiver : inv.sender;
            
            // Deduplicate by email
            if (!formattedMap.has(otherUser.email)) {
                formattedMap.set(otherUser.email, {
                    _id: inv._id,
                    userId: otherUser._id,
                    name: otherUser.name,
                    email: otherUser.email,
                    connectedAt: inv.updatedAt
                });
            }
        }
        const formattedConnections = Array.from(formattedMap.values());

        return res.status(200).json({ connections: formattedConnections });
    } catch (err) { console.error("[getConnections]", err); res.status(500).json({ message: "Server error" }); }
};

const removeConnection = async (req, res) => {
    const { connectionId } = req.params;
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });

        const invitation = await Invitation.findOne({
            _id: connectionId,
            $or: [{ sender: me._id }, { receiver: me._id }],
            status: "accepted"
        });

        if (!invitation) return res.status(404).json({ message: "Connection not found" });

        await Invitation.findByIdAndDelete(connectionId);
        
        return res.status(200).json({ message: "Connection removed successfully" });
    } catch (err) { console.error("[removeConnection]", err); res.status(500).json({ message: "Server error" }); }
};

// ── TEAM CRUD ─────────────────────────────────────────────────────────────────
/**
 * GET /getTeammates
 * Returns:
 *   ownedTeams    — teams this user leads
 *   memberOfTeams — teams this user is a member of
 * No "allConnections" — teams are now open (add anyone by email)
 */
const getTeammates = async (req, res) => {
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });
        const ownedTeams = await Team.find({ ownerId: me._id }).lean();
        const memberOfTeams = await Team.find({ "members.userId": me._id }).lean();
        return res.status(200).json({ ownedTeams, memberOfTeams });
    } catch (err) { console.error("[getTeammates]", err); res.status(500).json({ message: "Server error" }); }
};

/** POST /team/create — create a new named team (no limit) */
const createTeam = async (req, res) => {
    const { teamName } = req.body;
    if (!teamName?.trim()) return res.status(400).json({ message: "Team name is required" });
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });
        const team = await Team.create({ teamName: teamName.trim(), ownerId: me._id, members: [] });
        return res.status(201).json({ message: "Team created", team });
    } catch (err) {
        console.error("[createTeam]", err);
        // E11000 = duplicate key — old unique index still in MongoDB
        if (err.code === 11000) {
            return res.status(500).json({
                message: "Database has an old unique index preventing multiple teams. Run: node server/scripts/dropOwnerIndex.js",
                fix: "node server/scripts/dropOwnerIndex.js"
            });
        }
        res.status(500).json({ message: "Server error" });
    }
};

/** PUT /team/:teamId/rename */
const updateTeamName = async (req, res) => {
    const { teamId } = req.params;
    const { teamName } = req.body;
    if (!teamName?.trim()) return res.status(400).json({ message: "Team name is required" });
    try {
        const me = await userModel.findOne({ email: req.user.email });
        const team = await Team.findOneAndUpdate({ _id: teamId, ownerId: me._id }, { teamName: teamName.trim() }, { new: true });
        if (!team) return res.status(404).json({ message: "Team not found or you are not the owner" });
        return res.status(200).json({ message: "Team renamed", team });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/** DELETE /team/:teamId */
const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        const me = await userModel.findOne({ email: req.user.email });
        const team = await Team.findOneAndDelete({ _id: teamId, ownerId: me._id });
        if (!team) return res.status(404).json({ message: "Team not found or you are not the owner" });
        return res.status(200).json({ message: "Team deleted" });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/** DELETE /team/:teamId/member — remove a member */
const removeMember = async (req, res) => {
    const { teamId } = req.params;
    const { memberId } = req.body;
    try {
        const me = await userModel.findOne({ email: req.user.email });
        const team = await Team.findOneAndUpdate(
            { _id: teamId, ownerId: me._id },
            { $pull: { members: { userId: memberId } } },
            { new: true }
        );
        if (!team) return res.status(404).json({ message: "Team not found or you are not the owner" });
        return res.status(200).json({ message: "Member removed", team });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/** POST /team/:teamId/leave */
const leaveTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        const me = await userModel.findOne({ email: req.user.email });
        const team = await Team.findOneAndUpdate(
            { _id: teamId, "members.userId": me._id },
            { $pull: { members: { userId: me._id } } },
            { new: true }
        );
        if (!team) return res.status(404).json({ message: "Team not found or you are not a member" });
        return res.status(200).json({ message: "Left team" });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/**
 * POST /team/:teamId/add-member
 * Add ANY registered user to a team by email — NO prior connection needed.
 * Like WhatsApp: you can add anyone who has an account.
 */
const addMemberToTeam = async (req, res) => {
    const { teamId } = req.params;
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
    try {
        const me = await userModel.findOne({ email: req.user.email });
        if (!me) return res.status(404).json({ message: "User not found" });

        if (email.trim().toLowerCase() === me.email.toLowerCase())
            return res.status(400).json({ message: "You are already the team owner" });

        const team = await Team.findOne({ _id: teamId, ownerId: me._id });
        if (!team) return res.status(404).json({ message: "Team not found or you are not the owner" });

        const newMember = await userModel.findOne({ email: email.trim().toLowerCase() });
        if (!newMember) return res.status(404).json({ message: "No user found with that email address" });

        // Prevent duplicate
        if (team.members.some(m => m.userId.toString() === newMember._id.toString()))
            return res.status(400).json({ message: `${newMember.name || newMember.email} is already in this team` });

        team.members.push({ userId: newMember._id, name: newMember.name || "", email: newMember.email });
        await team.save();

        return res.status(200).json({ message: `${newMember.name || newMember.email} added to team`, team });
    } catch (err) { console.error("[addMemberToTeam]", err); res.status(500).json({ message: "Server error" }); }
};

// ── EMAIL / PASSWORD ──────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    const { otp, email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.verificationCode !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (Date.now() > user.verificationCodeExpiry) return res.status(400).json({ message: "OTP expired" });
        user.isVerified = true; user.verificationCode = null; user.verificationCodeExpiry = null;
        await user.save();
        return res.status(200).json({ message: "User verification successful" });
    } catch { res.status(500).json({ message: "Server error" }); }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "User already verified" });
        if (user.verificationCodeExpiry > Date.now())
            return res.status(400).json({ message: "OTP already sent. Please wait", expiresIn: Math.floor((user.verificationCodeExpiry - Date.now()) / 1000) });
        const otp = generateOtp();
        user.verificationCode = otp; user.verificationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save(); await sendMail(email, "OTP for CodeMeet", `Your OTP is: ${otp}`);
        return res.status(200).json({ message: "OTP resent", expiresIn: 300 });
    } catch { res.status(500).json({ message: "Server error" }); }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Invalid email format" });
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(200).json({ message: "If this email exists, a password reset link has been sent" });
        if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });
        const resetToken = generateOtp();
        user.resetPasswordToken = resetToken; user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        await sendMail(email, "Password Reset - CodeMeet", `Hi ${user.name},\n\nReset your password: ${resetLink}\n\nExpires in 15 minutes.`);
        return res.status(200).json({ message: "Password reset link sent", expiresIn: 900 });
    } catch { res.status(500).json({ message: "Server error" }); }
};

const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ message: "All fields required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    try {
        const user = await userModel.findOne({ email });
        if (!user || user.resetPasswordToken !== token) return res.status(400).json({ message: "Invalid reset token" });
        if (user.resetPasswordExpiry < Date.now()) return res.status(400).json({ message: "Reset token expired" });
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null; user.resetPasswordExpiry = null;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });
    } catch { res.status(500).json({ message: "Server error" }); }
};

const sendMeetingInvite = async (req, res) => {
    const { email, meetingId, meetingLink } = req.body;
    try {
        const recipient = await userModel.findOne({ email });
        if (!recipient) return res.status(404).json({ message: "User not found" });
        const link = meetingLink || `${process.env.FRONTEND_URL}/meeting/${meetingId}`;
        await sendMail(email, "You're invited to a meeting!", `Hi ${recipient.name},\n\nJoin: ${link}\nMeeting ID: ${meetingId}`);
        res.status(200).json({ message: "Invitation sent", meetingLink: link });
    } catch { res.status(500).json({ message: "Server error" }); }
};

export default {
    loginUser, registerUser, getUser,
    addTeamMate, getUserInvitations, acceptInvite, declineInvite,
    getConnections, removeConnection,
    getTeammates, createTeam, updateTeamName, deleteTeam,
    removeMember, leaveTeam, addMemberToTeam,
    verifyEmail, resendOtp, forgotPassword, resetPassword, sendMeetingInvite,
};