import React, { useContext, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AppContext from "../context/Context";
import { Box, Paper, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { Lock, Mail } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAlertMessage, setAlertType, setOpen, apiUrl } = useContext(AppContext);

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Validate URL parameters
  if (!email || !token) {
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
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#ffffff",
              marginBottom: "1rem",
              fontWeight: "700",
            }}
          >
            Invalid Reset Link
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: "2rem",
              fontSize: "0.95rem",
            }}
          >
            This password reset link is invalid or has expired. Please request a new one.
          </Typography>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button
              fullWidth
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
              Back to Login
            </Button>
          </Link>
        </Paper>
      </Box>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setAlertType("error");
      setAlertMessage("Passwords do not match");
      setOpen(true);
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setAlertType("error");
      setAlertMessage("Password must be at least 6 characters long");
      setOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/user/reset-password`, {
        email,
        token,
        newPassword: formData.newPassword,
      });

      setAlertType("success");
      setAlertMessage("Password reset successfully! Redirecting to login...");
      setOpen(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || "Failed to reset password");
      setOpen(true);
    } finally {
      setLoading(false);
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
            Reset Password
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "0.9rem",
            }}
          >
            Enter your new password below
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {/* New Password Field */}
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
                  New Password
                </Typography>
              </Box>
              <TextField
                type="password"
                name="newPassword"
                fullWidth
                required
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
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

            {/* Confirm Password Field */}
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
                  Confirm Password
                </Typography>
              </Box>
              <TextField
                type="password"
                name="confirmPassword"
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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

            {/* Submit Button */}
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
                "Reset Password"
              )}
            </Button>
          </Stack>
        </form>

        {/* Back to Login Link */}
        <Box sx={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
            Remember your password?{" "}
            <Link
              to="/login"
              style={{
                color: "#6ee7b7",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#34d399")}
              onMouseLeave={(e) => (e.target.style.color = "#6ee7b7")}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
