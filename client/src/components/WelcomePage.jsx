import React, { useContext, useState } from "react";
import { Box, Typography, TextField, Button, Stack, Snackbar, Alert, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { nanoid } from "nanoid";
import { Play, LinkIcon, Code2, Users, Zap } from "lucide-react";
import AppContext from "../context/Context";

const WelcomePage = () => {
  const { apiUrl, showDescription, setShowDescription, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!meetingId) return;
    try {
      const response = await axios.get(`${apiUrl}/meet/${meetingId}`);
      if (response.status === 200) {
        navigate(`/meet/join/${meetingId}`);
      } else {
        setSnack({
          open: true,
          msg: "This meeting is not available.",
          severity: "error",
        });
      }
    } catch {
      setSnack({
        open: true,
        msg: "This meeting is not available.",
        severity: "error",
      });
    }
  };

  const handleStartMeeting = async () => {
    if (!user) {
      navigate("/register");
      return;
    }
    const newMeetingId = `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
    await navigator.clipboard.writeText(newMeetingId);
    setSnack({
      open: true,
      msg: "Meeting ID copied to clipboard!",
      severity: "success",
    });

    navigate(`/meet/${newMeetingId}?isInitiator=true`);
  };

  // STEP 1: DESCRIPTION SCREEN
  if (showDescription && !user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <Paper
          elevation={24}
          sx={{
            background: "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)",
            borderRadius: "1rem",
            padding: "3rem 2.5rem",
            width: "100%",
            maxWidth: "650px",
            border: "1px solid rgba(110, 231, 183, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Logo Section */}
          <Box sx={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: "800",
                  color: "#0d1117",
                  letterSpacing: "-0.05em",
                }}
              >
                CM
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: "1.75rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.75rem",
              }}
            >
              Welcome to CodeMeet
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.95rem",
              }}
            >
              Collaborate in real-time with your teammates
            </Typography>
          </Box>

          {/* Features */}
          <Stack spacing={2.5} sx={{ marginBottom: "2.5rem" }}>
            {[
              { icon: Code2, text: "Real-time collaborative coding with live code sharing" },
              { icon: Users, text: "Built-in video conferencing with team members" },
              { icon: Zap, text: "Instant messaging and project file management" },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(110, 231, 183, 0.1)",
                  borderRadius: "0.5rem",
                }}
              >
                <item.icon size={24} style={{ color: "#6ee7b7", flexShrink: 0, marginTop: "0.125rem" }} />
                <Typography sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* CTA Button */}
          <Button
            fullWidth
            onClick={() => setShowDescription(false)}
            sx={{
              background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
              color: "#0d1117",
              fontWeight: "700",
              fontSize: "1rem",
              padding: "0.875rem 1.5rem",
              borderRadius: "0.5rem",
              textTransform: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
              "&:hover": {
                boxShadow: "0 12px 32px rgba(110, 231, 183, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Get Started →
          </Button>
        </Paper>
      </Box>
    );
  }

  // STEP 2: MAIN UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <Paper
        elevation={24}
        sx={{
          background: "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)",
          borderRadius: "1rem",
          padding: "3rem 2.5rem",
          width: "100%",
          maxWidth: "550px",
          border: "1px solid rgba(110, 231, 183, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
              borderRadius: "0.75rem",
              marginBottom: "1rem",
              boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.75rem",
                fontWeight: "800",
                color: "#0d1117",
                letterSpacing: "-0.05em",
              }}
            >
              CM
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}
          >
            Start Collaborating
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "0.9rem",
            }}
          >
            Join an existing session or create a new one
          </Typography>
        </Box>

        {/* Join Meeting Section */}
        <Box sx={{ marginBottom: "2rem" }}>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "#6ee7b7",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Join a Session
          </Typography>
          <form onSubmit={handleJoinMeeting}>
            <Stack spacing={2}>
              <TextField
                placeholder="Enter meeting ID (abc-defg-hij)"
                type="text"
                fullWidth
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                required
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
                type="submit"
                fullWidth
                sx={{
                  background: "rgba(110, 231, 183, 0.15)",
                  border: "1.5px solid rgba(110, 231, 183, 0.5)",
                  color: "#6ee7b7",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(110, 231, 183, 0.25)",
                    borderColor: "rgba(110, 231, 183, 0.8)",
                  },
                }}
                startIcon={<LinkIcon size={20} />}
              >
                Join Meeting
              </Button>
            </Stack>
          </form>
        </Box>

        {/* Divider */}
        <Divider
          sx={{
            marginY: "2rem",
            borderColor: "rgba(110, 231, 183, 0.2)",
          }}
        />

        {/* Start Meeting Section */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: "#6ee7b7",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
          </Typography>
          <Button
            onClick={handleStartMeeting}
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
              color: "#0d1117",
              fontWeight: "700",
              fontSize: "0.95rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              textTransform: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
              "&:hover": {
                boxShadow: "0 12px 32px rgba(110, 231, 183, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
            startIcon={<Play size={20} />}
          >
            {user ? "Start New Meeting" : "Sign Up to Start"}
          </Button>
          {!user && (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", marginTop: "1rem" }}>
              Create an account to host your own meetings
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 1 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WelcomePage;
