import { useState, useRef, useContext } from "react";
import {
  Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Button, Snackbar, Alert, Popper, Paper
} from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import {
  Mic, MicOff, Video, VideoOff,
  MonitorUp, MonitorX, Share2,
  MessageSquare, Code2, EllipsisVertical,
} from "lucide-react";
import AppContext from "../../context/Context";

/**
 * Props:
 *   videoOn           {boolean}
 *   audioOn           {boolean}
 *   isScreenSharing   {boolean}  – local is sharing
 *   isRemoteSharing   {boolean}  – remote is sharing (replaces isRemoteScreenSharing)
 *   manageStream      {fn(audio, video)}
 *   disconnectCall    {fn}
 *   openChatWindow    {fn}
 *   openEditor        {fn}
 *   handleShareScreen {fn}
 *   sendMeetingInvitation {fn(email)}
 */
const Controls = ({
  videoOn,
  audioOn,
  isScreenSharing,
  isRemoteSharing,
  hasRemoteUser,
  manageStream,
  disconnectCall,
  openChatWindow,
  openEditor,
  handleShareScreen,
  sendMeetingInvitation,
}) => {
  const { setAlertMessage, setAlertType, setOpen } = useContext(AppContext);
  const [localAlert, setLocalAlert] = useState(false);
  const [localAlertMsg, setLocalAlertMsg] = useState("");

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const anchorRef = useRef(null);

  const toggleAudio = () => manageStream(!audioOn, videoOn);
  const toggleVideo = () => manageStream(audioOn, !videoOn);

  const onScreenShare = () => {
    // Cannot share screen when no one else is in the meeting
    if (!hasRemoteUser && !isScreenSharing) {
      setLocalAlertMsg("You can only share your screen when another participant is present");
      setLocalAlert(true);
      return;
    }
    if (isRemoteSharing && !isScreenSharing) {
      setLocalAlertMsg("Someone else is already sharing their screen");
      setLocalAlert(true);
      return;
    }
    handleShareScreen();
  };

  const handleSendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalAlertMsg("Please enter a valid email address");
      setLocalAlert(true);
      return;
    }
    setInviteSending(true);
    try { await sendMeetingInvitation(email); }
    finally { setInviteSending(false); setInviteEmail(""); setInviteOpen(false); }
  };

  const circleBtn = (active, danger, highlight) => ({
    width: 48, height: 48, borderRadius: "50%",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s",
    backgroundColor: danger
      ? "#c0392b"
      : highlight
        ? "#1a73e8"
        : active
          ? "rgba(255,255,255,0.18)"
          : "#c0392b",
  });

  return (
    <>
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 12, alignItems: "center",
        backgroundColor: "rgba(24,24,24,0.92)",
        backdropFilter: "blur(14px)",
        padding: "10px 22px", borderRadius: 48,
        border: "1px solid rgba(255,255,255,0.08)",
        zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}>
        {/* MIC */}
        <button onClick={toggleAudio} title={audioOn ? "Mute" : "Unmute"}
          style={circleBtn(audioOn, false, false)}>
          {audioOn ? <Mic size={20} color="#fff" /> : <MicOff size={20} color="#fff" />}
        </button>

        {/* CAMERA */}
        <button onClick={toggleVideo} title={videoOn ? "Turn off camera" : "Turn on camera"}
          style={circleBtn(videoOn, false, false)}>
          {videoOn ? <Video size={20} color="#fff" /> : <VideoOff size={20} color="#fff" />}
        </button>

        {/* SCREEN SHARE — disabled when alone or remote is sharing */}
        <button
          onClick={onScreenShare}
          title={
            isScreenSharing
              ? "Stop sharing"
              : !hasRemoteUser
                ? "Waiting for another participant to join"
                : isRemoteSharing
                  ? "Someone else is sharing"
                  : "Share screen"
          }
          style={{
            ...circleBtn(true, false, isScreenSharing),
            opacity: (!hasRemoteUser && !isScreenSharing) || (isRemoteSharing && !isScreenSharing) ? 0.4 : 1,
            cursor: (!hasRemoteUser && !isScreenSharing) || (isRemoteSharing && !isScreenSharing) ? "not-allowed" : "pointer",
          }}>
          {isScreenSharing
            ? <MonitorX size={20} color="#fff" />
            : <MonitorUp size={20} color="#fff" />}
        </button>

        {/* DIVIDER */}
        <div style={{ width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.12)" }} />

        {/* END CALL */}
        <button onClick={disconnectCall} title="Leave meeting"
          style={{ ...circleBtn(true, true, false), width: 56 }}>
          <CallEndIcon style={{ color: "#fff", fontSize: 20 }} />
        </button>

        {/* MORE OPTIONS */}
        <button ref={anchorRef} onClick={() => setOptionsOpen(o => !o)} title="More options"
          style={{ ...circleBtn(true, false, false), backgroundColor: optionsOpen ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)" }}>
          <EllipsisVertical size={20} color="#fff" />
        </button>
      </div>

      {/* Options popover */}
      <Popper open={optionsOpen} anchorEl={anchorRef.current} placement="top"
        style={{ zIndex: 300 }}
        modifiers={[{ name: "offset", options: { offset: [0, 14] } }]}>
        <Paper style={{
          backgroundColor: "#1e1e1e", border: "1px solid #333",
          borderRadius: 12, padding: "6px 0", minWidth: 200,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}>
          {[
            { icon: <MessageSquare size={15} />, label: "In-call messages", action: () => { openChatWindow(); setOptionsOpen(false); } },
            { icon: <Code2 size={15} />, label: "Collaborative editor", action: () => { openEditor(); setOptionsOpen(false); } },
            { icon: <Share2 size={15} />, label: "Invite guest", action: () => { setInviteOpen(true); setOptionsOpen(false); } },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", background: "none", border: "none",
              color: "#ddd", cursor: "pointer", fontSize: 13,
              width: "100%", textAlign: "left",
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a2a2a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              {icon} {label}
            </button>
          ))}
        </Paper>
      </Popper>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}
        PaperProps={{ style: { borderRadius: 14, minWidth: 360 } }}>
        <DialogTitle>Send meeting invitation</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth margin="dense" type="email"
            label="Recipient email" variant="outlined"
            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendInvite()}
            disabled={inviteSending} placeholder="colleague@example.com" />
        </DialogContent>
        <DialogActions style={{ padding: "4px 16px 16px" }}>
          <Button onClick={() => setInviteOpen(false)} disabled={inviteSending}>Cancel</Button>
          <Button onClick={handleSendInvite} variant="contained"
            disabled={inviteSending || !inviteEmail.trim()}>
            {inviteSending ? "Sending…" : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Local error snackbar (screen share conflict, invalid email, etc.) */}
      <Snackbar open={localAlert} autoHideDuration={4000}
        onClose={() => setLocalAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setLocalAlert(false)} severity="warning" sx={{ width: "100%" }}>
          {localAlertMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Controls;