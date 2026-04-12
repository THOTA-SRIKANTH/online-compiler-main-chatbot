import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, Users, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppContext from "../../context/Context";
import { useSocket } from "../../context/SocketProvider";

const MAX_PARTICIPANTS = 2;

const MeetingLandingPage = () => {
  const { mediaOptions, setMediaOptions, user, apiUrl } = useContext(AppContext);
  const socket = useSocket();
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [audio, setAudio] = useState(mediaOptions.audio);
  const [video, setVideo] = useState(mediaOptions.video);
  const [permissionError, setPermissionError] = useState(false);
  // "checking" → REST call in progress
  // "ok"       → room has space, show Join button
  // "full"     → room already has 2 users, show error
  const [roomStatus, setRoomStatus] = useState("checking");
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [joining, setJoining] = useState(false);

  // ── CAMERA PREVIEW ───────────────────────────────────────────────────────
  const startPreview = useCallback(async (a, v) => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (!a && !v) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: v, audio: a });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionError(false);
    } catch {
      setPermissionError(true);
    }
  }, []);

  useEffect(() => {
    startPreview(audio, video);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []); // eslint-disable-line

  // ── CAPACITY CHECK via REST ───────────────────────────────────────────────
  // Runs on mount so the user sees the error immediately on the lobby screen
  // instead of entering the meeting room and disrupting existing participants.
  useEffect(() => {
    if (!apiUrl || !id) return;
    let cancelled = false;

    const checkCapacity = async () => {
      setRoomStatus("checking");
      try {
        const res = await fetch(`${apiUrl}/meet/${id}`);
        const data = await res.json();
        if (cancelled) return;

        setRoomParticipants(data.participants || []);

        if (res.status === 403 || data.full) {
          setRoomStatus("full");
          // Stop camera preview — no point keeping it on if they can't join
          streamRef.current?.getTracks().forEach(t => t.stop());
          streamRef.current = null;
          if (videoRef.current) videoRef.current.srcObject = null;
        } else {
          setRoomStatus("ok");
        }
      } catch {
        // Network error — let the server's socket guard handle it
        if (!cancelled) setRoomStatus("ok");
      }
    };

    checkCapacity();
    return () => { cancelled = true; };
  }, [apiUrl, id]);

  // ── SOCKET "room-full" GUARD ──────────────────────────────────────────────
  // Secondary safety net: handles the race condition where two people pass the
  // REST check simultaneously and both try to join at the same moment.
  // The server rejects the later arrival via this socket event.
  useEffect(() => {
    if (!socket) return;
    const onRoomFull = ({ participants } = {}) => {
      setRoomParticipants(participants || []);
      setRoomStatus("full");
      setJoining(false);
      // Stop camera — user cannot join
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    socket.on("room-full", onRoomFull);
    return () => socket.off("room-full", onRoomFull);
  }, [socket]);

  // ── TOGGLE MIC / CAMERA ──────────────────────────────────────────────────
  const toggleAudio = () => {
    const next = !audio;
    setAudio(next);
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = next; });
  };

  const toggleVideo = async () => {
    const next = !video;
    setVideo(next);
    if (!next) {
      streamRef.current?.getVideoTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      await startPreview(audio, true);
    }
  };

  // ── JOIN ─────────────────────────────────────────────────────────────────
  const handleJoin = () => {
    if (roomStatus !== "ok" || joining) return;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setMediaOptions({ audio, video });
    setJoining(true);
    navigate(`/meet/${id}`);
  };

  // ── DERIVED ──────────────────────────────────────────────────────────────
  const isFull = roomStatus === "full";
  const isChecking = roomStatus === "checking";

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      backgroundColor: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 48,
      flexWrap: "wrap",
    }}>

      {/* ── LEFT: Camera preview ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 480, height: 270,
          borderRadius: 16,
          backgroundColor: "#1c1c1c",
          overflow: "hidden",
          position: "relative",
          border: `1.5px solid ${isFull ? "#c0392b" : "#333"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border-color 0.3s",
        }}>
          {video && !permissionError && !isFull ? (
            <video ref={videoRef} autoPlay muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 14,
            }}>
              {isFull ? (
                /* Red icon when room is full */
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  backgroundColor: "rgba(192,57,43,0.15)",
                  border: "2px solid #c0392b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertCircle size={38} color="#c0392b" />
                </div>
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  backgroundColor: "#1a6b3c",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700, color: "#fff",
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              {permissionError && !isFull && (
                <p style={{ color: "#e74c3c", fontSize: 13, textAlign: "center", maxWidth: 300 }}>
                  Camera/microphone access denied. Check your browser permissions.
                </p>
              )}
              {!video && !permissionError && !isFull && (
                <p style={{ color: "#666", fontSize: 13 }}>Camera is off</p>
              )}
            </div>
          )}
        </div>

        {/* Mic / Camera buttons — greyed out when room is full */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { active: audio, toggle: toggleAudio, Icon: Mic, OffIcon: MicOff, title: audio ? "Mute" : "Unmute" },
            { active: video, toggle: toggleVideo, Icon: Video, OffIcon: VideoOff, title: video ? "Turn off camera" : "Turn on camera" },
          ].map(({ active, toggle, Icon, OffIcon, title }) => (
            <button
              key={title}
              onClick={isFull ? undefined : toggle}
              title={title}
              style={{
                width: 52, height: 52, borderRadius: "50%",
                backgroundColor: isFull ? "#2a2a2a" : active ? "rgba(255,255,255,0.15)" : "#c0392b",
                border: "none", cursor: isFull ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
                opacity: isFull ? 0.35 : 1,
              }}
            >
              {active ? <Icon size={22} color="#fff" /> : <OffIcon size={22} color="#fff" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Join panel OR full-room error ── */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 20,
        maxWidth: 360, textAlign: "center",
      }}>

        {isFull ? (
          /* ── ROOM FULL ERROR UI ───────────────────────────────────────── */
          <>
            {/* Error card */}
            <div style={{
              padding: "24px 28px",
              backgroundColor: "rgba(192,57,43,0.1)",
              border: "1.5px solid rgba(192,57,43,0.45)",
              borderRadius: 16,
              display: "flex", flexDirection: "column", gap: 14,
              width: "100%",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  backgroundColor: "rgba(192,57,43,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertCircle size={20} color="#e74c3c" />
                </div>
                <span style={{ color: "#e74c3c", fontWeight: 700, fontSize: 20 }}>
                  Meeting is full
                </span>
              </div>

              {/* Explanation */}
              <p style={{ color: "#ccc", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                This meeting already has{" "}
                <strong style={{ color: "#fff" }}>
                  {MAX_PARTICIPANTS}/{MAX_PARTICIPANTS}
                </strong>{" "}
                participants. Only {MAX_PARTICIPANTS} people can join at a time.
              </p>

              {/* Who is already in the meeting */}
              {roomParticipants.length > 0 && (
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: 12,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <p style={{ color: "#777", fontSize: 12, margin: 0 }}>
                    Currently in the meeting:
                  </p>
                  {roomParticipants.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center",
                      gap: 10, justifyContent: "center",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        backgroundColor: "#2d4a8a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#fff",
                        flexShrink: 0,
                      }}>
                        {p.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span style={{ color: "#ccc", fontSize: 14 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Go back button */}
            <button
              onClick={() => navigate("/home")}
              style={{
                padding: "12px 36px", borderRadius: 30,
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#ccc",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer", fontSize: 15, fontWeight: 500,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.16)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
            >
              ← Back to home
            </button>
          </>
        ) : (
          /* ── NORMAL JOIN UI ───────────────────────────────────────────── */
          <>
            <div>
              <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>
                {isChecking ? "Checking meeting…" : "Ready to join?"}
              </h2>
              <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
                Meeting ID:{" "}
                <span style={{ color: "#ccc", fontFamily: "monospace" }}>{id}</span>
              </p>
              {user && (
                <p style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
                  Joining as{" "}
                  <strong style={{ color: "#aaa" }}>{user.name}</strong>
                </p>
              )}
            </div>

            {/* Participant limit badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 16px", borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <Users size={13} color="#777" />
              <span style={{ color: "#777", fontSize: 12 }}>
                Max {MAX_PARTICIPANTS} participants per meeting
              </span>
            </div>

            <div style={{ fontSize: 13, color: "#666" }}>
              {!audio && !video
                ? "You will join without camera and microphone"
                : !video
                  ? "You will join without camera"
                  : !audio
                    ? "You will join without microphone"
                    : "Camera and microphone are on"}
            </div>

            <button
              onClick={handleJoin}
              disabled={isChecking || joining}
              style={{
                padding: "14px 44px",
                borderRadius: 30,
                backgroundColor: "#1a73e8",
                color: "#fff",
                border: "none",
                cursor: (isChecking || joining) ? "default" : "pointer",
                fontSize: 16,
                fontWeight: 600,
                opacity: (isChecking || joining) ? 0.6 : 1,
                transition: "opacity 0.2s, transform 0.1s",
              }}
              onMouseDown={e => { if (!isChecking && !joining) e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {joining ? "Joining…" : isChecking ? "Checking…" : "Join now"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MeetingLandingPage;