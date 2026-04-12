import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import AppContext from "../../context/Context";

/**
 * MeetingChatbot — connected to the real /api/chat/stream SSE backend.
 *
 * The backend at POST /api/chat/stream accepts:
 *   { message: string, history: [{role, content}] }
 * and streams SSE events:
 *   data: {"content": "chunk"}
 *   data: {"done": true, "fullContent": "..."}
 *   data: [DONE]
 *
 * Features:
 *  - Streaming token-by-token rendering (typewriter effect)
 *  - Conversation history sent with every message
 *  - Markdown code block detection (monospace rendering)
 *  - Stop generation button
 */
const MeetingChatbot = ({ meetingId, participants = [], socket = null }) => {
  const { apiUrl, user } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I'm your AI coding assistant for this meeting. Ask me anything — code help, debugging, explanations, or reviews.",
      streaming: false,
    },
  ]);
  const [streaming, setStreaming] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);   // AbortController for active SSE fetch

  // ── SOCKET SYNC LOGIC ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleSync = ({ messages: syncMessages }) => {
      // Don't overwrite if we are currently the one typing/streaming!
      if (!streaming) {
        setMessages(syncMessages);
      }
    };
    socket.on("chatbot-sync", handleSync);
    return () => {
      socket.off("chatbot-sync", handleSync);
    };
  }, [socket, streaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Build history for the API (exclude initial greeting, exclude streaming placeholder)
  const buildHistory = useCallback((msgs) =>
    msgs
      .filter(m => !m.streaming && m.id !== 1)
      .map(m => ({ role: m.role, content: m.content })),
    []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    // Add user message
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      streaming: false,
    };

    // Placeholder for streaming bot response
    const botPlaceholderId = Date.now() + 1;
    const botPlaceholder = {
      id: botPlaceholderId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    setMessages(prev => {
      const next = [...prev, userMsg, botPlaceholder];
      socket?.emit("chatbot-sync", { roomId: meetingId, messages: next });
      return next;
    });
    setStreaming(true);

    // Build history from current messages + new user msg
    const history = buildHistory([...messages, userMsg]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${apiUrl}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              const snap = accumulated;
              setMessages(prev => {
                const next = prev.map(m =>
                  m.id === botPlaceholderId
                    ? { ...m, content: snap }
                    : m
                );
                // Synchronize chunk to other peer
                socket?.emit("chatbot-sync", { roomId: meetingId, messages: next });
                return next;
              });
            }
            if (parsed.done) {
              // Final message — mark as not streaming
              const final = parsed.fullContent || accumulated;
              setMessages(prev => {
                const next = prev.map(m =>
                  m.id === botPlaceholderId
                    ? { ...m, content: final, streaming: false }
                    : m
                );
                socket?.emit("chatbot-sync", { roomId: meetingId, messages: next });
                return next;
              });
            }
          } catch (_) { }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // User stopped generation — keep whatever was accumulated
        setMessages(prev => {
          const next = prev.map(m =>
            m.id === botPlaceholderId
              ? { ...m, streaming: false, content: m.content || "(stopped)" }
              : m
          );
          socket?.emit("chatbot-sync", { roomId: meetingId, messages: next });
          return next;
        });
      } else {
        console.error("[MeetingChatbot] SSE error:", err);
        setMessages(prev => {
          const next = prev.map(m =>
            m.id === botPlaceholderId
              ? { ...m, streaming: false, content: "⚠️ Failed to get a response. Did you forget to set OPENROUTER_API_KEY in the server `.env` file?" }
              : m
          );
          socket?.emit("chatbot-sync", { roomId: meetingId, messages: next });
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, messages, buildHistory, apiUrl, meetingId, socket]);

  const stopGeneration = () => {
    abortRef.current?.abort();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── RENDER HELPERS ────────────────────────────────────────────────────────
  // Simple code block detection: wrap ```...``` in monospace
  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
        return (
          <pre key={i} style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6, padding: "8px 12px",
            fontFamily: "monospace", fontSize: 12,
            overflowX: "auto", margin: "6px 0",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            color: "#86efac",
          }}>
            {code}
          </pre>
        );
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Open AI assistant"
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(16,185,129,0.35)",
          zIndex: 999,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <Bot size={24} color="#fff" />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      width: 380, height: 580,
      backgroundColor: "#0d1117",
      border: "1px solid rgba(16,185,129,0.25)",
      borderRadius: 16,
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      display: "flex", flexDirection: "column",
      zIndex: 1000, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px",
        background: "linear-gradient(135deg, #065f46, #047857)",
        borderBottom: "1px solid rgba(16,185,129,0.15)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, color: "#fff", fontSize: 14, fontWeight: 600 }}>
              AI Coding Assistant
            </p>
            <p style={{ margin: 0, color: "rgba(16,185,129,0.8)", fontSize: 11 }}>
              {streaming ? "Thinking…" : `In meeting${participants.filter(Boolean).length > 0 ? ` with ${participants.filter(Boolean).join(", ")}` : ""}`}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.6)", padding: 4, borderRadius: 6,
          display: "flex",
        }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "12px",
        display: "flex", flexDirection: "column", gap: 10,
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(16,185,129,0.3) transparent",
      }}>
        {messages.map(msg => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
              alignItems: "flex-end", gap: 6,
            }}>
              {!isUser && (
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Bot size={14} color="#fff" />
                </div>
              )}
              <div style={{
                maxWidth: "82%",
                backgroundColor: isUser
                  ? "linear-gradient(135deg, #6ee7b7, #34d399)"
                  : "rgba(255,255,255,0.07)",
                background: isUser
                  ? "linear-gradient(135deg, #6ee7b7, #34d399)"
                  : "rgba(255,255,255,0.07)",
                border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                padding: "9px 12px",
                color: isUser ? "#0d1117" : "#e2e8f0",
                fontSize: 13, lineHeight: 1.55,
              }}>
                {renderContent(msg.content)}
                {msg.streaming && (
                  <span style={{
                    display: "inline-block", width: 8, height: 8,
                    borderRadius: "50%", backgroundColor: "#10b981",
                    marginLeft: 4, verticalAlign: "middle",
                    animation: "pulse 1s infinite",
                  }} />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(16,185,129,0.12)",
        display: "flex", gap: 8, alignItems: "flex-end",
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={streaming ? "AI is thinking…" : "Ask for coding help…"}
          disabled={streaming}
          rows={1}
          style={{
            flex: 1, resize: "none", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 10, padding: "8px 12px",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "#e2e8f0", fontSize: 13, outline: "none",
            lineHeight: 1.4, maxHeight: 90, overflowY: "auto",
            fontFamily: "inherit",
            opacity: streaming ? 0.5 : 1,
          }}
        />
        {streaming ? (
          <button
            onClick={stopGeneration}
            title="Stop generating"
            style={{
              width: 38, height: 38, borderRadius: "50%",
              backgroundColor: "#c0392b",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
            <span style={{ width: 12, height: 12, backgroundColor: "#fff", borderRadius: 2 }} />
          </button>
        ) : (
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            title="Send"
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: input.trim()
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "rgba(255,255,255,0.1)",
              border: "none", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}>
            <Send size={16} color="#fff" />
          </button>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
    </div>
  );
};

export default MeetingChatbot;