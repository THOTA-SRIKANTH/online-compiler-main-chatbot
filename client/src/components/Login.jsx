import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../context/Context";
import { Box, Paper, Typography, TextField, Button, Stack, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Lock, Mail, X } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { setAlertMessage, setAlertType, setOpen, setUser, apiUrl } =
    useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/user/login`, formData);
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        setUser(user);
        setAlertType("success");
        setAlertMessage("Login successful");
        setOpen(true);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || "Login failed");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setAlertType("error");
      setAlertMessage("Please enter your email address");
      setOpen(true);
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/user/forgot-password`, {
        email: forgotPasswordEmail,
      });
      setAlertType("success");
      setAlertMessage("Password reset link sent to your email");
      setOpen(true);
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || "Failed to send reset email");
      setOpen(true);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

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
          maxWidth: "450px",
          border: "1px solid rgba(110, 231, 183, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Logo Section */}
        <Box sx={{ textAlign: "center", marginBottom: "2rem" }}>
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
              marginBottom: "0.5rem",
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "0.9rem",
            }}
          >
            Login to your CodeMeet account
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {/* Email Field */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Mail size={18} style={{ color: "#6ee7b7" }} />
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#ffffff",
                  }}
                >
                  Email
                </Typography>
              </Box>
              <TextField
                type="email"
                name="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
            </Box>

            {/* Password Field */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Lock size={18} style={{ color: "#6ee7b7" }} />
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#ffffff",
                  }}
                >
                  Password
                </Typography>
              </Box>
              <TextField
                type="password"
                name="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
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
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
                color: "#0d1117",
                fontWeight: "700",
                fontSize: "1rem",
                padding: "0.875rem 1.5rem",
                borderRadius: "0.5rem",
                textTransform: "none",
                marginTop: "1rem",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
                "&:hover:not(:disabled)": {
                  boxShadow: "0 12px 32px rgba(110, 231, 183, 0.4)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  opacity: 0.7,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#0d1117" }} />
              ) : (
                "Login"
              )}
            </Button>
          </Stack>
        </form>

        {/* Sign Up Link */}
        <Box sx={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#6ee7b7",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#34d399")}
              onMouseLeave={(e) => (e.target.style.color = "#6ee7b7")}
            >
              Sign up
            </Link>
          </Typography>
          <Box sx={{ marginTop: "1rem" }}>
            <button
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: "none",
                border: "none",
                color: "#6ee7b7",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#34d399")}
              onMouseLeave={(e) => (e.target.style.color = "#6ee7b7")}
            >
              Forgot Password?
            </button>
          </Box>
        </Box>

        {/* Forgot Password Dialog */}
        <Dialog
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)",
              border: "1px solid rgba(110, 231, 183, 0.1)",
              borderRadius: "1rem",
            },
          }}
        >
          <DialogTitle
            sx={{
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "1rem",
            }}
          >
            Reset Password
            <button
              onClick={() => setShowForgotPassword(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
              }}
            >
              <X size={24} />
            </button>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ marginTop: "1rem" }}>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Mail size={18} style={{ color: "#6ee7b7" }} />
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#ffffff",
                  }}
                >
                  Email
                </Typography>
              </Box>
              <TextField
                type="email"
                fullWidth
                required
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
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
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: "1.5rem 1.5rem 1.5rem 1.5rem", gap: "1rem" }}>
            <Button
              onClick={() => setShowForgotPassword(false)}
              sx={{
                color: "#6ee7b7",
                fontWeight: "600",
                textTransform: "none",
                fontSize: "0.95rem",
                border: "1.5px solid rgba(110, 231, 183, 0.5)",
                padding: "0.5rem 1.5rem",
                borderRadius: "0.5rem",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(110, 231, 183, 0.1)",
                  borderColor: "rgba(110, 231, 183, 0.8)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              sx={{
                background: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
                color: "#0d1117",
                fontWeight: "700",
                fontSize: "0.95rem",
                padding: "0.5rem 1.5rem",
                borderRadius: "0.5rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 24px rgba(110, 231, 183, 0.3)",
                "&:hover:not(:disabled)": {
                  boxShadow: "0 12px 32px rgba(110, 231, 183, 0.4)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  opacity: 0.7,
                },
              }}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={20} sx={{ color: "#0d1117" }} />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Login;
