import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, Button, Paper, Typography, Stack, IconButton } from "@mui/material";
import { Send, X, MessageCircle, Minimize2, Maximize2 } from "lucide-react";

const Chatbot = ({ isShared = false, participants = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI coding assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: getAIResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInputValue("");
  };

  const getAIResponse = (userInput) => {
    const responses = {
      help: "I can help you with:\n• Code debugging and optimization\n• Syntax errors\n• Algorithm explanations\n• Best practices\nWhat would you like help with?",
      syntax: "For syntax help, please share the code snippet you're working with, and I'll help identify any issues.",
      debug: "To debug your code, please share:\n1. The problematic code\n2. The expected output\n3. The actual output\n4. Any error messages",
      hello: "Hello! 👋 I'm here to assist you with your coding questions and help explain complex concepts.",
      default: "I understand you're asking about: " + userInput + "\n\nCould you provide more details? For example:\n• Share the code snippet\n• Describe the issue\n• What have you already tried?",
    };

    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes("help")) return responses.help;
    if (lowerInput.includes("syntax")) return responses.syntax;
    if (lowerInput.includes("debug")) return responses.debug;
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) return responses.hello;
    return responses.default;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        sx={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
          color: "#0d1117",
          fontSize: "1.25rem",
          fontWeight: 700,
          boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
          transition: "all 0.3s ease",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            boxShadow: "0 12px 32px rgba(110, 231, 183, 0.4)",
            transform: "scale(1.1)",
          },
        }}
      >
        <MessageCircle size={28} />
      </Button>
    );
  }

  return (
    <Paper
      elevation={24}
      sx={{
        position: "fixed",
        bottom: isMinimized ? "2rem" : "2rem",
        right: "2rem",
        width: isMinimized ? 320 : 420,
        height: isMinimized ? 60 : 600,
        background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
        border: "1px solid rgba(110, 231, 183, 0.2)",
        borderRadius: "1rem",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)",
          padding: "1rem",
          borderBottom: "1px solid rgba(110, 231, 183, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageCircle size={18} color="#0d1117" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#ffffff", fontSize: "0.9rem" }}>
              AI Assistant
            </Typography>
            {isShared && (
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(110, 231, 183, 0.7)" }}>
                Shared with {participants.length} user{participants.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setIsMinimized(!isMinimized)}
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              "&:hover": { color: "#6ee7b7" },
            }}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsOpen(false)}
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              "&:hover": { color: "#f87171" },
            }}
          >
            <X size={18} />
          </IconButton>
        </Box>
      </Box>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <Stack
            sx={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              gap: 1.5,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255, 255, 255, 0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(110, 231, 183, 0.3)",
                borderRadius: "3px",
                "&:hover": {
                  background: "rgba(110, 231, 183, 0.5)",
                },
              },
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  sx={{
                    maxWidth: "85%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background:
                      message.sender === "user"
                        ? "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)"
                        : "rgba(255, 255, 255, 0.08)",
                    border:
                      message.sender === "user"
                        ? "none"
                        : "1px solid rgba(110, 231, 183, 0.2)",
                  }}
                >
                  <Typography
                    sx={{
                      color: message.sender === "user" ? "#0d1117" : "#ffffff",
                      fontSize: "0.9rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontWeight: message.sender === "user" ? 600 : 500,
                    }}
                  >
                    {message.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>

          {/* Input Area */}
          <Box
            sx={{
              padding: "1rem",
              borderTop: "1px solid rgba(110, 231, 183, 0.1)",
              display: "flex",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={3}
              minRows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#ffffff",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(110, 231, 183, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(110, 231, 183, 0.4)",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "#6ee7b7",
                    boxShadow: "0 0 0 3px rgba(110, 231, 183, 0.1)",
                  },
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.4)",
                  opacity: 1,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              sx={{
                minWidth: 44,
                height: 44,
                background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
                color: "#0d1117",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(110, 231, 183, 0.2)",
                "&:hover:not(:disabled)": {
                  boxShadow: "0 8px 20px rgba(110, 231, 183, 0.3)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <Send size={20} />
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default Chatbot;
