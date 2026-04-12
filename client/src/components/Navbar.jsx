import React, { useContext, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Paper, Divider, Box, Tooltip } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AppContext from "../context/Context";
import { CircleUser, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // True if currently in an active meeting room (not the join screen)
  const inMeeting = /^\/meet\/[^\/]+$/.test(location.pathname);

  const handleLogout = () => {
    navigate("/login");
    setProfileOpen(false);
    logout();
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
          borderBottom: "1px solid #2d3748",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
          {/* Logo */}
          <Box
            component={inMeeting ? "div" : Link}
            to={inMeeting ? undefined : "/"}
            sx={{
              textDecoration: "none", display: "flex", alignItems: "center", gap: 1,
              cursor: inMeeting ? "not-allowed" : "pointer",
              opacity: inMeeting ? 0.8 : 1,
            }}
            onClick={(e) => {
              if (inMeeting) {
                e.preventDefault();
                alert("Please use the 'End Call' button (the red phone icon) to leave the meeting properly.");
              }
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#064e3b",
                fontSize: 14,
              }}
            >
              CM
            </div>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.05em",
                fontSize: 18,
              }}
            >
              CodeMeet
            </Typography>
          </Box>

          {/* Right side buttons */}
          {user?.name ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!inMeeting && (
                <Button
                  component={Link}
                  to="/home"
                  sx={{
                    color: "#6ee7b7",
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 6,
                    border: "1px solid rgba(110, 231, 183, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(110, 231, 183, 0.1)",
                      borderColor: "rgba(110, 231, 183, 0.6)",
                    },
                  }}
                >
                  Home
                </Button>
              )}
              <Button
                onClick={() => setProfileOpen(!profileOpen)}
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(110, 231, 183, 0.1)",
                  border: "1px solid rgba(110, 231, 183, 0.3)",
                  "&:hover": {
                    background: "rgba(110, 231, 183, 0.2)",
                  },
                }}
              >
                <CircleUser size={20} color="#6ee7b7" />
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: "#a5b4fc",
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  "&:hover": { color: "#c7d2fe" },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                sx={{
                  background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                  color: "#064e3b",
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  borderRadius: 8,
                  "&:hover": {
                    background: "linear-gradient(135deg, #5ee3ad, #24c389)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {profileOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            top: "70px",
            right: "20px",
            width: "280px",
            background: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)",
            border: "1px solid #2d3748",
            borderRadius: 12,
            p: 2.5,
            zIndex: 1000,
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                borderRadius: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#064e3b",
                fontWeight: 700,
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#f9fafb", fontSize: 14 }}>
                {user?.name}
              </Typography>
              <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: "#2d3748" }} />

          <Button
            fullWidth
            onClick={handleLogout}
            sx={{
              color: "#f87171",
              justifyContent: "flex-start",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              py: 1,
              "&:hover": { background: "rgba(248, 113, 113, 0.1)" },
            }}
            startIcon={<LogOut size={18} />}
          >
            Logout
          </Button>
        </Paper>
      )}

    </>
  );
};

export default Navbar;
