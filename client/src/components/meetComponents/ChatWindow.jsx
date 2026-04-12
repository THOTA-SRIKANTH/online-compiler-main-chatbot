import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

/**
 * ChatWindow (meeting) — fixed version.
 *
 * Fixes:
 *  1. Enter key sends message
 *  2. Auto-scroll to latest message
 *  3. Dark theme matching meeting UI
 *  4. Empty message guard
 *  5. Timestamp display
 */
const ChatWindow = ({ closeChat, socket, roomId, messages, addMessage, user }) => {
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = message.trim();
    if (!text || !socket) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    socket.emit("message", text, time, user?.name || "You", roomId);
    addMessage(text, time, "You");
    setMessage("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1a1a1a",
      color: "#fff",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px",
        borderBottom: "1px solid #333",
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>In-call messages</span>
        <button onClick={closeChat} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#aaa", display: "flex", padding: 4, borderRadius: 6,
        }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {messages.length === 0 && (
          <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => {
          const isSelf = msg.sender === "You";
          return (
            <div key={i} style={{
              alignSelf: isSelf ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}>
              {!isSelf && (
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 3px 2px" }}>
                  {msg.sender}
                </p>
              )}
              <div style={{
                backgroundColor: isSelf ? "#1a73e8" : "#2a2a2a",
                padding: "8px 12px",
                borderRadius: isSelf ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                fontSize: 14, lineHeight: 1.4,
              }}>
                {msg.message}
              </div>
              <p style={{
                fontSize: 10, color: "#555", margin: "3px 4px 0",
                textAlign: isSelf ? "right" : "left",
              }}>
                {msg.time}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid #2a2a2a",
        display: "flex", gap: 8, alignItems: "flex-end",
        flexShrink: 0,
      }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message…"
          rows={1}
          style={{
            flex: 1, resize: "none", border: "1px solid #333",
            borderRadius: 20, padding: "8px 14px",
            backgroundColor: "#2a2a2a", color: "#fff",
            fontSize: 14, outline: "none", lineHeight: 1.4,
            maxHeight: 100, overflowY: "auto",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            backgroundColor: message.trim() ? "#1a73e8" : "#333",
            border: "none", cursor: message.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.2s",
          }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;