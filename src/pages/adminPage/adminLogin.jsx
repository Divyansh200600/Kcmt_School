import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, InputAdornment, IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { Visibility, VisibilityOff, Email } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { auth, firestore } from '../../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user'); // Role selection (user/admin/management)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        // Check if the selected role matches the role stored in Firestore
        if (userData.role === role) {
          // Role matches, proceed to the dashboard
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome back!',
            showConfirmButton: false,
            timer: 1500,
          });

          // Navigate based on the role selected and the role in Firestore
          switch (userData.role) {
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'user':
              navigate('/user-dashboard');
              break;
            case 'management':
              navigate('/management-dashboard');
              break;
            default:
              Swal.fire({
                icon: 'error',
                title: 'Role Not Recognized',
                text: 'Your role is not recognized. Please contact support.',
              });
          }
        } else {
          // Role mismatch error
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Your role does not match the selected role.',
          });
        }
      } else {
        // No user data found in Firestore
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'No user found.',
        });
      }
    } catch (error) {
      // Handle login error
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message,
      });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Welcome Back
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
          Please log in to your account
        </Typography>

        <form onSubmit={handleLogin}>
          <Box mb={2}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                },
              }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton>
                      <VisibilityOff color="primary" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                },
              }}
            />
          </Box>

          {/* Role Selection (Admin/User/Management) */}
          <Box mb={2}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Role</FormLabel>
              <RadioGroup
                row
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <FormControlLabel value="user" control={<Radio />} label="User" />
                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                <FormControlLabel value="management" control={<Radio />} label="Management" />
              </RadioGroup>
            </FormControl>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              mb: 1,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '15px',
              boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.15)',
              backgroundColor: '#764ba2',
              '&:hover': {
                backgroundColor: '#667eea',
              },
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
