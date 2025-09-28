import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { GoogleJwtPayload } from '../types/auth';

interface GoogleSignInProps {
  onSignInSuccess: (userInfo: GoogleJwtPayload) => void;
  onSignInError: (error: string) => void;
  errorMessage?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSignInSuccess,
  onSignInError,
  errorMessage
}) => {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        onSignInError('No credential received from Google');
        return;
      }

      // Decode the JWT token to get user information
      const userInfo: GoogleJwtPayload = jwtDecode(credentialResponse.credential);

      // Check if email is verified
      if (!userInfo.email_verified) {
        onSignInError('Please verify your email address with Google');
        return;
      }

      onSignInSuccess(userInfo);
    } catch (error) {
      console.error('Error decoding Google credential:', error);
      onSignInError('Failed to process Google sign-in response');
    }
  };

  const handleError = () => {
    onSignInError('Google sign-in failed. Please try again.');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Hilik Shmilik
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sign in with your Google account to access the application
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: 'block' }}
        >
          Only Hilik, and Hilik only, can access this application
        </Typography>
      </Paper>
    </Box>
  );
};

export default GoogleSignIn;