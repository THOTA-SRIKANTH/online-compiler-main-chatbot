import {
  useContext, useEffect, useRef, useState, useCallback
} from "react";
import Controls from "./Controls";
import AppContext from "../../context/Context";
import ChatWindow from "./ChatWindow";
import Editor from "./Editor.jsx";
import MeetingChatbot from "./MeetingChatbot.jsx";
import { useNavigate, useParams } from "react-router-dom";
import peer from "../services/PeerService.jsx";
import { useSocket } from "../../context/SocketProvider.jsx";

const Meeting = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    apiUrl, setAlertMessage, setAlertType, setOpen,
    mediaOptions, setMediaOptions, user
  } = useContext(AppContext);

  // ── REFS ─────────────────────────────────────────────────────────────────
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);   // local screen share <video>
  const remoteScreenRef = useRef(null);   // remote screen share <video>

  const userStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenShareStreamRef = useRef(null);

  const remoteUserSocketRef = useRef(null);
  const joinedRef = useRef(false);
  const videoSenderRef = useRef(null);
  const audioSenderRef = useRef(null);
  const primaryRemoteStreamIdRef = useRef(null);

  // ── STATE ─────────────────────────────────────────────────────────────────
  const [userStream, setUserStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState(null);

  const [remoteUserName, setRemoteUserName] = useState(null);
  const [remoteUserLeft, setRemoteUserLeft] = useState(false);

  // Who is currently screen-sharing? null | "local" | "remote"
  const [screenSharer, setScreenSharer] = useState(null);

  const [videoOn, setVideoOn] = useState(mediaOptions.video);
  const [audioOn, setAudioOn] = useState(mediaOptions.audio);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteAudioOn, setRemoteAudioOn] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [connStatus, setConnStatus] = useState("connecting");

  // Derived helpers
  const isScreenSharing = screenSharer === "local";
  const isRemoteSharing = screenSharer === "remote";
  const showScreenLayout = screenSharer !== null;

  // Keep stream refs mirrored
  useEffect(() => { userStreamRef.current = userStream; }, [userStream]);
  useEffect(() => { remoteStreamRef.current = remoteStream; }, [remoteStream]);
  useEffect(() => { screenShareStreamRef.current = screenShareStream; }, [screenShareStream]);

  // ── ALWAYS-ON VIDEO ELEMENT SYNC ─────────────────────────────────────────
  // Runs every render — cheap but guarantees srcObject is always wired even
  // after layout switches (screen share mode mounts new video elements).
  useEffect(() => {
    if (localVideoRef.current && userStream) {
      localVideoRef.current.srcObject = userStream;
    }
  });
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  });
  useEffect(() => {
    if (screenShareRef.current && screenShareStream) {
      screenShareRef.current.srcObject = screenShareStream;
    }
    if (remoteScreenRef.current && remoteScreenStream) {
      remoteScreenRef.current.srcObject = remoteScreenStream;
    }
  });

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const addMessage = useCallback((msg, time, sender) => {
    setMessages(prev => [...prev, { message: msg, time, sender }]);
  }, []);

  // ── JOIN ROOM ─────────────────────────────────────────────────────────────
  const joinMeet = useCallback(() => {
    if (!socket || joinedRef.current) return;
    joinedRef.current = true;
    socket.emit("join-room", { id, name: user.name });
  }, [socket, id, user]);

  // ── INITIAL STREAM ────────────────────────────────────────────────────────
  const getStream = useCallback(async () => {
    peer.reset();
    primaryRemoteStreamIdRef.current = null;
    videoSenderRef.current = null;
    audioSenderRef.current = null;

    let stream = null;
    if (mediaOptions.video || mediaOptions.audio) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: mediaOptions.video,
          audio: mediaOptions.audio,
        });
      } catch (err) {
        console.warn("[Meeting] getUserMedia failed:", err.name);
      }
    }

    if (stream) {
      for (const track of stream.getTracks()) {
        const sender = peer.addTrack(track, stream);
        if (track.kind === "video") videoSenderRef.current = sender;
        if (track.kind === "audio") audioSenderRef.current = sender;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setUserStream(stream);
      userStreamRef.current = stream;
    }

    joinMeet();
  }, [mediaOptions.video, mediaOptions.audio, joinMeet]);

  // ── WEBRTC HANDLERS ───────────────────────────────────────────────────────
  const handleUserJoined = useCallback(async ({ newUserId, name }) => {
    setRemoteUserLeft(false);
    setRemoteUserName(name);
    remoteUserSocketRef.current = newUserId;
    try {
      const offer = await peer.getOffer();
      socket.emit("offer", { offer, to: newUserId, name: user.name });
    } catch (err) { console.error("[Meeting] getOffer:", err); }
    // ── FIX: If we are currently sharing our screen, re-announce it to the
    // new joiner so they immediately see the screen-share layout instead of
    // having our screen stream appear in their camera tile.
    if (screenShareStreamRef.current) {
      socket?.emit("screen-share-start", { roomId: id });
    }
  }, [socket, user, id]);

  const handleOffer = useCallback(async ({ offer, from, name }) => {
    setRemoteUserLeft(false);
    setRemoteUserName(name);
    remoteUserSocketRef.current = from;
    try {
      const ans = await peer.getAnswer(offer);
      socket.emit("answer", { answer: ans, to: from });
    } catch (err) { console.error("[Meeting] getAnswer:", err); }
  }, [socket]);

  const handleAnswer = useCallback(async ({ answer }) => {
    try { await peer.setLocalDescription(answer); }
    catch (err) { console.error("[Meeting] setLocalDescription:", err); }
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate }) => {
    if (!candidate) return;
    await peer.addIceCandidate(candidate);
  }, []);

  const handleNegotiationIncoming = useCallback(async ({ from, offer }) => {
    try {
      const ans = await peer.getAnswer(offer);
      socket.emit("nego-done", { to: from, answer: ans });
    } catch (err) { console.error("[Meeting] nego answer:", err); }
  }, [socket]);

  const handleNegotiationFinal = useCallback(async ({ answer }) => {
    try { await peer.setLocalDescription(answer); }
    catch (err) { console.error("[Meeting] nego final:", err); }
  }, []);

  const handleUserLeft = useCallback(({ userId }) => {
    if (userId !== remoteUserSocketRef.current) return;
    setRemoteUserName(null);
    setRemoteStream(null);
    setRemoteScreenStream(null);
    // If remote was sharing screen, clean that up
    setScreenSharer(prev => prev === "remote" ? null : prev);
    // If WE were sharing screen, stop it — no one to share with anymore
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(t => t.stop());
      screenShareStreamRef.current = null;
      setScreenShareStream(null);
      setScreenSharer(null);
      if (screenShareRef.current) screenShareRef.current.srcObject = null;
      // No need to emit screen-share-stop — the other user already left
    }
    remoteStreamRef.current = null;
    primaryRemoteStreamIdRef.current = null;
    remoteUserSocketRef.current = null;
    setRemoteUserLeft(true);
    setTimeout(() => setRemoteUserLeft(false), 5000);
  }, []);

  const handleTrack = useCallback((e) => {
    const { track, streams } = e;
    const stream = streams?.[0];
    if (!track || !stream) return;

    if (track.kind === "audio") {
      if (!primaryRemoteStreamIdRef.current) {
        primaryRemoteStreamIdRef.current = stream.id;
      }
      const existing = remoteStreamRef.current;
      if (existing && existing.id === stream.id) {
        if (!existing.getTracks().find(t => t.id === track.id)) existing.addTrack(track);
        const updated = new MediaStream(existing.getTracks());
        setRemoteStream(updated);
        remoteStreamRef.current = updated;
      } else {
        setRemoteStream(stream);
        remoteStreamRef.current = stream;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      }
      return;
    }

    // Video track
    if (!primaryRemoteStreamIdRef.current) {
      primaryRemoteStreamIdRef.current = stream.id;
      setRemoteStream(stream);
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    } else if (stream.id === primaryRemoteStreamIdRef.current) {
      const existing = remoteStreamRef.current;
      if (existing) {
        existing.getVideoTracks().forEach(t => existing.removeTrack(t));
        existing.addTrack(track);
        const updated = new MediaStream(existing.getTracks());
        setRemoteStream(updated);
        remoteStreamRef.current = updated;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = updated;
      } else {
        setRemoteStream(stream);
        remoteStreamRef.current = stream;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      }
    } else {
      // Different stream = remote screen share
      setRemoteScreenStream(stream);
      if (remoteScreenRef.current) remoteScreenRef.current.srcObject = stream;
    }
  }, []);

  const handleNegotiationNeeded = useCallback(async () => {
    const to = remoteUserSocketRef.current;
    if (!to) return;
    try {
      const offer = await peer.getOffer();
      socket.emit("nego-needed", { offer, to });
    } catch (err) { console.error("[Meeting] nego needed:", err); }
  }, [socket]);

  const handleConnStateChange = useCallback(() => {
    const s = peer.connectionState;
    if (s === "connected") setConnStatus("connected");
    else if (s === "failed" || s === "disconnected") setConnStatus("failed");
    else if (s === "connecting") setConnStatus("connecting");
  }, []);

  const handleExistingUsers = useCallback(({ users, screensharerId, code: roomCode, language: roomLanguage }) => {
    if (!users?.length) return;
    const { socketId, name } = users[0];
    setRemoteUserName(name);
    remoteUserSocketRef.current = socketId;

    // ── FIX: Restore the first person's current code & language.
    // When the 2nd person joins, the server sends whatever code/language the
    // 1st person has been working on.  We apply it here so the new joiner
    // starts with the same editor state instead of a blank/default program.
    // We only overwrite if the room actually has content (non-empty string).
    if (roomCode) {
      setCode(roomCode);
    }
    if (roomLanguage) {
      setLanguage(roomLanguage);
    }

    // If someone is already sharing their screen, activate layout immediately
    if (screensharerId) {
      setScreenSharer("remote");
    }
  }, []);

  // ── SCREEN SHARE SOCKET EVENTS ─────────────────────────────────────────
  // Remote started sharing — show error only ONCE via setAlertMessage in Controls
  // (not here, to avoid double-trigger)
  const handleRemoteScreenShareStart = useCallback(() => {
    setScreenSharer("remote");
  }, []);

  const handleRemoteScreenShareStop = useCallback(() => {
    // Return to normal meeting layout
    setScreenSharer(null);
    setRemoteScreenStream(null);
    if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
  }, []);

  const handleMediaStateChanged = useCallback(({ video: rv, audio: ra }) => {
    setRemoteVideoOn(rv);
    setRemoteAudioOn(ra);
  }, []);

  // ── EFFECTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    getStream();
    return () => {
      userStreamRef.current?.getTracks().forEach(t => t.stop());
      screenShareStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    const pc = peer.peer;
    const onIce = (e) => {
      if (e.candidate && remoteUserSocketRef.current) {
        socket?.emit("ice-candidate", { candidate: e.candidate, to: remoteUserSocketRef.current });
      }
    };
    pc.addEventListener("track", handleTrack);
    pc.addEventListener("negotiationneeded", handleNegotiationNeeded);
    pc.addEventListener("connectionstatechange", handleConnStateChange);
    pc.addEventListener("icecandidate", onIce);
    return () => {
      pc.removeEventListener("track", handleTrack);
      pc.removeEventListener("negotiationneeded", handleNegotiationNeeded);
      pc.removeEventListener("connectionstatechange", handleConnStateChange);
      pc.removeEventListener("icecandidate", onIce);
    };
  }, [handleTrack, handleNegotiationNeeded, handleConnStateChange, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("user-joined", handleUserJoined);
    socket.on("existing-users", handleExistingUsers);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left", handleUserLeft);
    socket.on("nego-needed", handleNegotiationIncoming);
    socket.on("nego-final", handleNegotiationFinal);
    socket.on("screen-share-start", handleRemoteScreenShareStart);
    socket.on("screen-share-stop", handleRemoteScreenShareStop);
    socket.on("media-state-changed", handleMediaStateChanged);
    socket.on("codeChange", ({ code: c }) => setCode(c));
    socket.on("change-language", (lang) => setLanguage(lang));
    socket.on("message", addMessage);
    const onReconnect = () => { joinedRef.current = false; joinMeet(); };
    socket.on("reconnect", onReconnect);

    // Room-full: server rejected this socket because 2 participants already exist.
    // This fires only in a race condition (two users passed the REST check at the
    // same instant). Stop media, show alert, go back to home.
    const onRoomFull = () => {
      setAlertMessage("This meeting is full. Only 2 participants are allowed.");
      setAlertType("error");
      setOpen(true);
      userStreamRef.current?.getTracks().forEach(t => t.stop());
      screenShareStreamRef.current?.getTracks().forEach(t => t.stop());
      setTimeout(() => navigate("/home"), 1800);
    };
    socket.on("room-full", onRoomFull);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("existing-users", handleExistingUsers);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left", handleUserLeft);
      socket.off("nego-needed", handleNegotiationIncoming);
      socket.off("nego-final", handleNegotiationFinal);
      socket.off("screen-share-start", handleRemoteScreenShareStart);
      socket.off("screen-share-stop", handleRemoteScreenShareStop);
      socket.off("media-state-changed", handleMediaStateChanged);
      socket.off("codeChange");
      socket.off("change-language");
      socket.off("message", addMessage);
      socket.off("reconnect", onReconnect);
      socket.off("room-full", onRoomFull);
    };
  }, [socket, handleUserJoined, handleExistingUsers, handleOffer, handleAnswer,
    handleIceCandidate, handleUserLeft, handleNegotiationIncoming, handleNegotiationFinal,
    handleRemoteScreenShareStart, handleRemoteScreenShareStop,
    handleMediaStateChanged, addMessage, joinMeet]);

  // ── TOGGLE AUDIO / VIDEO ──────────────────────────────────────────────────
  const manageStream = useCallback(async (newAudio, newVideo) => {
    const prevAudio = audioOn;
    const prevVideo = videoOn;
    setAudioOn(newAudio);
    setVideoOn(newVideo);
    setMediaOptions({ audio: newAudio, video: newVideo });
    socket?.emit("media-state", { roomId: id, video: newVideo, audio: newAudio });

    const stream = userStreamRef.current;

    // Audio toggle
    if (newAudio !== prevAudio) {
      if (stream?.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach(t => { t.enabled = newAudio; });
      } else if (newAudio) {
        try {
          const ns = await navigator.mediaDevices.getUserMedia({ audio: true });
          const at = ns.getAudioTracks()[0];
          stream?.addTrack(at);
          audioSenderRef.current = peer.addTrack(at, stream || ns);
        } catch (err) {
          console.error("[Meeting] acquire audio:", err);
          setAudioOn(false);
        }
      }
    }

    // Video toggle
    if (newVideo !== prevVideo) {
      if (!newVideo) {
        stream?.getVideoTracks().forEach(t => { t.enabled = false; t.stop(); stream.removeTrack(t); });
        // Send black frame so remote knows video is off
        if (videoSenderRef.current) {
          try {
            const canvas = Object.assign(document.createElement("canvas"), { width: 2, height: 2 });
            canvas.getContext("2d").fillRect(0, 0, 2, 2);
            const blackTrack = canvas.captureStream(1).getVideoTracks()[0];
            await videoSenderRef.current.replaceTrack(blackTrack);
          } catch (_) { }
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
      } else {
        try {
          const ns = await navigator.mediaDevices.getUserMedia({ video: true });
          const newTrack = ns.getVideoTracks()[0];
          if (stream) {
            stream.getVideoTracks().forEach(t => stream.removeTrack(t));
            stream.addTrack(newTrack);
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          } else {
            const newStream = new MediaStream([newTrack]);
            setUserStream(newStream);
            userStreamRef.current = newStream;
            if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
          }
          if (videoSenderRef.current) {
            await videoSenderRef.current.replaceTrack(newTrack).catch(console.error);
          } else {
            videoSenderRef.current = peer.addTrack(newTrack, userStreamRef.current);
          }
        } catch (err) {
          console.error("[Meeting] camera restart:", err);
          setVideoOn(false);
          setMediaOptions({ audio: newAudio, video: false });
        }
      }
    }
  }, [audioOn, videoOn, setMediaOptions, socket, id]);

  // ── SCREEN SHARE ──────────────────────────────────────────────────────────
  const handleShareScreen = useCallback(async () => {
    // Stop sharing
    if (isScreenSharing) {
      const ss = screenShareStreamRef.current;
      ss?.getTracks().forEach(t => t.stop());
      setScreenShareStream(null);
      setScreenSharer(null);
      if (screenShareRef.current) screenShareRef.current.srcObject = null;
      socket?.emit("screen-share-stop", { roomId: id });
      const screenTrackIds = new Set(ss?.getTracks().map(t => t.id) ?? []);
      peer.getSenders().forEach(s => {
        if (s.track && screenTrackIds.has(s.track.id)) peer.removeTrack(s);
      });
      return;
    }

    // Guard: no remote participant yet — screen share is pointless and
    // would cause the incoming WebRTC track to corrupt the camera tile
    if (!remoteUserSocketRef.current) {
      setAlertMessage("Screen sharing is only available when another participant has joined.");
      setAlertType("info");
      setOpen(true);
      return;
    }

    // Guard: remote already sharing
    if (isRemoteSharing) return;

    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setScreenShareStream(screen);
      setScreenSharer("local");
      if (screenShareRef.current) screenShareRef.current.srcObject = screen;
      socket?.emit("screen-share-start", { roomId: id });

      screen.getTracks().forEach(t => {
        peer.addTrack(t, screen);
        t.onended = () => {
          setScreenShareStream(null);
          setScreenSharer(null);
          if (screenShareRef.current) screenShareRef.current.srcObject = null;
          socket?.emit("screen-share-stop", { roomId: id });
        };
      });
    } catch (err) {
      if (err.name !== "NotAllowedError") console.error("[Meeting] getDisplayMedia:", err);
    }
  }, [isScreenSharing, isRemoteSharing, socket, id, setAlertMessage, setAlertType, setOpen]);

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  const disconnectCall = useCallback(() => {
    userStreamRef.current?.getTracks().forEach(t => t.stop());
    screenShareStreamRef.current?.getTracks().forEach(t => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (screenShareRef.current) screenShareRef.current.srcObject = null;
    peer.getSenders().forEach(s => { try { peer.removeTrack(s); } catch (_) { } });
    socket?.emit("leave-room", { roomId: id });
    setTimeout(() => navigate("/home"), 300);
  }, [socket, id, navigate]);

  const sendMeetingInvitation = useCallback(async (email) => {
    const token = localStorage.getItem("token");
    const meetingLink = `${window.location.origin}/meet/join/${id}`;
    try {
      const res = await fetch(`${apiUrl}/api/user/send-meeting-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, meetingId: id, meetingLink }),
      });
      const data = await res.json();
      setAlertMessage(res.ok ? `Invitation sent to ${email}` : data.message || "Failed");
      setAlertType(res.ok ? "success" : "error");
      setOpen(true);
    } catch {
      setAlertMessage("Error sending invitation"); setAlertType("error"); setOpen(true);
    }
  }, [apiUrl, id, setAlertMessage, setAlertType, setOpen]);

  // ── PARTICIPANT TILE ───────────────────────────────────────────────────────
  // video element always rendered (ref stability); visibility via CSS
  const ParticipantTile = ({ videoRef, stream, name, muted, isSelf, camOn, isSmall }) => {
    const showVideo = camOn && !!stream;
    return (
      <div style={{
        position: "relative",
        width: "100%", height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#1c1c1c",
        border: "1.5px solid #2a2a2a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <video
          ref={videoRef}
          autoPlay muted={muted} playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            display: showVideo ? "block" : "none",
            backgroundColor: "#000",
          }}
        />
        {!showVideo && (
          <div style={{
            width: isSmall ? 36 : 68, height: isSmall ? 36 : 68,
            borderRadius: "50%",
            backgroundColor: isSelf ? "#1a6b3c" : "#2d4a8a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isSmall ? 16 : 26, fontWeight: 700, color: "#fff",
            userSelect: "none", zIndex: 1,
          }}>
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 8, left: 10, zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.65)",
          color: "#fff", fontSize: isSmall ? 11 : 13,
          padding: "2px 8px", borderRadius: 6,
          display: "flex", alignItems: "center", gap: 4,
          maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          backdropFilter: "blur(4px)",
        }}>
          {name || (isSelf ? "You" : "Participant")}
          {isSelf && !audioOn && <span title="Muted" style={{ fontSize: 11 }}>🔇</span>}
          {!isSelf && !remoteAudioOn && <span title="Muted" style={{ fontSize: 11 }}>🔇</span>}
        </div>
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh",
      overflow: "hidden", backgroundColor: "#0f0f0f",
    }}>
      {/* Editor side panel */}
      {editorOpen && (
        <div style={{ width: "40vw", height: "100vh", flexShrink: 0 }}>
          <Editor
            socket={socket} id={id}
            closeEditor={() => setEditorOpen(false)}
            changeCode={setCode} changeLanguage={setLanguage}
            code={code} language={language}
          />
        </div>
      )}

      {/* Main video area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden", position: "relative",
      }}>
        {/* Connection banner */}
        {connStatus === "failed" && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            zIndex: 200, backgroundColor: "#c0392b", color: "#fff",
            padding: "6px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          }}>
            Connection lost — trying to reconnect…
          </div>
        )}

        {showScreenLayout ? (
          // ── SCREEN SHARE LAYOUT ──────────────────────────────────────────
          <>
            {/* Main screen area */}
            <div style={{
              flex: 1, margin: "12px 12px 0",
              position: "relative", borderRadius: 14,
              overflow: "hidden", backgroundColor: "#000",
            }}>
              {/* Local screen share — only shown when local user is sharing */}
              {isScreenSharing && (
                <video ref={screenShareRef} autoPlay playsInline muted
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              )}
              {/* Remote screen — ALWAYS in DOM so ref exists when WebRTC track arrives
                  (track can arrive BEFORE the screen-share-start socket signal) */}
              <video ref={remoteScreenRef} autoPlay playsInline
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "contain",
                  display: isRemoteSharing ? "block" : "none",
                }} />
              {/* Presenter label */}
              <div style={{
                position: "absolute", top: 12, left: 14, zIndex: 10,
                background: "rgba(0,0,0,0.65)", color: "#fff",
                fontSize: 13, padding: "4px 14px", borderRadius: 6,
                backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {"\uD83D\uDDA5\uFE0F "}
                {isScreenSharing
                  ? "You are presenting"
                  : `${remoteUserName || "Participant"} is presenting`}
              </div>
            </div>

            {/* Mini video strip — BOTH participants shown at bottom during screen share */}
            <div style={{
              display: "flex", gap: 10, alignItems: "center",
              padding: "6px 14px 82px",
              height: 152, flexShrink: 0,
            }}>
              {/* Local mini tile */}
              <div style={{ width: 210, height: 118, flexShrink: 0 }}>
                <ParticipantTile
                  videoRef={localVideoRef}
                  stream={userStream}
                  name={user?.name || "You"}
                  muted isSelf isSmall camOn={videoOn}
                />
              </div>
              {/* Remote mini tile */}
              <div style={{ width: 210, height: 118, flexShrink: 0 }}>
                {remoteUserName ? (
                  <ParticipantTile
                    videoRef={remoteVideoRef}
                    stream={remoteStream}
                    name={remoteUserName}
                    isSmall camOn={remoteVideoOn}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%", borderRadius: 12,
                    backgroundColor: "#1c1c1c", border: "1.5px dashed #333",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    color: "#555", gap: 6,
                  }}>
                    <span style={{ fontSize: 22 }}>👥</span>
                    <span style={{ fontSize: 11 }}>{remoteUserLeft ? "Left" : "Waiting…"}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // ── NORMAL LAYOUT: side-by-side split screen ────────────────────────
          <div style={{
            flex: 1, display: "flex", gap: 10,
            padding: "12px 12px 80px", overflow: "hidden",
          }}>
            {/* Local tile — always shown */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <ParticipantTile
                videoRef={localVideoRef}
                stream={userStream}
                name={user?.name || "You"}
                muted isSelf camOn={videoOn}
              />
            </div>

            {/* Remote tile — shows status when no one joined yet */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {remoteUserName ? (
                <ParticipantTile
                  videoRef={remoteVideoRef}
                  stream={remoteStream}
                  name={remoteUserName}
                  camOn={remoteVideoOn}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  borderRadius: 12,
                  backgroundColor: "#1c1c1c",
                  border: "1.5px dashed #333",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  color: "#555", gap: 14,
                }}>
                  <span style={{ fontSize: 40 }}>👥</span>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 15, color: "#888", fontWeight: 600 }}>
                      {remoteUserLeft ? "Participant left" : "Waiting for someone to join…"}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#555" }}>
                      {remoteUserLeft
                        ? "The other participant has left the meeting"
                        : "Share the meeting link to invite someone"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <Controls
          videoOn={videoOn}
          audioOn={audioOn}
          isScreenSharing={isScreenSharing}
          isRemoteSharing={isRemoteSharing}
          hasRemoteUser={!!remoteUserName}
          manageStream={manageStream}
          disconnectCall={disconnectCall}
          openChatWindow={() => setChatOpen(true)}
          openEditor={() => setEditorOpen(true)}
          handleShareScreen={handleShareScreen}
          sendMeetingInvitation={sendMeetingInvitation}
        />
      </div>

      {/* Chat side panel */}
      {chatOpen && (
        <div style={{ width: 320, height: "100vh", flexShrink: 0, borderLeft: "1px solid #222" }}>
          <ChatWindow
            closeChat={() => setChatOpen(false)}
            socket={socket} roomId={id}
            messages={messages} addMessage={addMessage} user={user}
          />
        </div>
      )}

      {/* AI Chatbot — connected to real backend */}
      <MeetingChatbot meetingId={id} participants={[remoteUserName]} socket={socket} />
    </div>
  );
};

export default Meeting;