import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, CircularProgress } from '@mui/material';
import { Mail, Lock, User } from 'lucide-react';
import AppContext from '../context/Context';

const Signup = () => {
    const navigate = useNavigate();
    const { setAlertMessage, setAlertType, setOpen } = useContext(AppContext);
    const { apiUrl } = useContext(AppContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        let tempErrors = {};

        if (!formData.name.trim()) {
            tempErrors.name = "Name is required";
        }

        if (!formData.email) {
            tempErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            tempErrors.email = "Invalid email format";
        }

        if (!formData.password) {
            tempErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            tempErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
            tempErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        
        console.log("Sending registration data:", formData);
        
        try {
            const response = await axios.post(`${apiUrl}/api/user/register`, formData);
            console.log("Registration response:", response);
            
            if(response.status == 201){
                setAlertType("success");
                setAlertMessage("Otp sent to your email");
                setOpen(true);
                navigate(`/verify-email?email=${formData.email}`);
            }else{
                setAlertType("error");
                setAlertMessage("Error in signing up");
                console.log(response);
            }
        } catch (error) {
            console.error("Registration error:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);
            
            const message = error.response?.data?.message || "Signup failed";
            const expiresIn=error.response?.data?.expiresIn
            let fieldErrors = {};
            if (message === "User already exists") {
                fieldErrors.email = "Email already exists";
            }else if (message === "OTP already sent. Please wait before requesting again") {
                fieldErrors.api = `${message} (${Math.floor(expiresIn / 60)} min left)`;
            } 
            else {
                fieldErrors.api = message;
            }
            if (message?.includes("OTP already sent")) {
                navigate(`/verify-email?email=${formData.email}`);
            }
            setErrors(fieldErrors);
            setAlertType("error");
            setAlertMessage(message);
        }
        finally{
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
                    maxWidth: "500px",
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
                        Create Account
                    </Typography>
                    <Typography
                        sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.9rem",
                        }}
                    >
                        Join CodeMeet and start collaborating
                    </Typography>
                </Box>

                {/* Error Alert */}
                {errors.api && (
                    <Box
                        sx={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#fca5a5",
                                fontSize: "0.85rem",
                                fontWeight: "500",
                            }}
                        >
                            {errors.api}
                        </Typography>
                    </Box>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        {/* Name Field */}
                        <Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <User size={18} style={{ color: "#6ee7b7" }} />
                                <Typography
                                    sx={{
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        color: "#ffffff",
                                    }}
                                >
                                    Full Name
                                </Typography>
                            </Box>
                            <TextField
                                name="name"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                error={!!errors.name}
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
                                        "&.Mui-error": {
                                            borderColor: "#ef4444",
                                        },
                                    },
                                    "& .MuiOutlinedInput-input::placeholder": {
                                        color: "rgba(255, 255, 255, 0.4)",
                                        opacity: 1,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "transparent",
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "#fca5a5",
                                        fontSize: "0.8rem",
                                        marginTop: "0.5rem",
                                    },
                                }}
                                helperText={errors.name}
                            />
                        </Box>

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
                                error={!!errors.email}
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
                                        "&.Mui-error": {
                                            borderColor: "#ef4444",
                                        },
                                    },
                                    "& .MuiOutlinedInput-input::placeholder": {
                                        color: "rgba(255, 255, 255, 0.4)",
                                        opacity: 1,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "transparent",
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "#fca5a5",
                                        fontSize: "0.8rem",
                                        marginTop: "0.5rem",
                                    },
                                }}
                                helperText={errors.email}
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
                                error={!!errors.password}
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
                                        "&.Mui-error": {
                                            borderColor: "#ef4444",
                                        },
                                    },
                                    "& .MuiOutlinedInput-input::placeholder": {
                                        color: "rgba(255, 255, 255, 0.4)",
                                        opacity: 1,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "transparent",
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "#fca5a5",
                                        fontSize: "0.8rem",
                                        marginTop: "0.5rem",
                                    },
                                }}
                                helperText={errors.password}
                            />
                        </Box>

                        {/* Sign Up Button */}
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
                                "Create Account"
                            )}
                        </Button>
                    </Stack>
                </form>

                {/* Login Link */}
                <Box sx={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
                        Already have an account?{" "}
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

export default Signup;
