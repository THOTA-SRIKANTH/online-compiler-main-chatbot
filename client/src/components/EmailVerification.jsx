import React, { useContext } from 'react';
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Box,
  Stack
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppContext from '../context/Context';
import axios from 'axios';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { apiUrl } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = e.target['otp'].value.trim();

    if (otp.length !== 6) {
      alert("OTP length should be 6 characters.");
      return;
    }
    if (!email) {
      alert("Email id not found");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/user/verify-email`, {
        email,
        otp
      });

      if (response.status === 200) {
        alert(response.data.message);
        navigate("/login");
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert("Verification failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, mt: 10 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Email Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
          Enter the 6-digit OTP sent to: <strong>{email}</strong>
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Enter OTP"
              name="otp"
              variant="outlined"
              inputProps={{ maxLength: 6 }}
              required
            />
            <Button type="submit" variant="contained" fullWidth>
              Verify Email
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerification;
