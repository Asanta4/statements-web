import { useState, useEffect } from 'react'
import { Container, CssBaseline, ThemeProvider, createTheme, Box, GlobalStyles } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import CSVUpload from './components/CSVUpload'
import CheckImageUpload from './components/CheckImageUpload'
import FinalProcessing from './components/FinalProcessing'
import GoogleSignIn from './components/GoogleSignIn'
import { ProcessedCSV, ImageAnalysisResult } from './types'
import AppMenu from './components/AppMenu'
import FileHistory from './components/FileHistory'
import MatchingRules from './components/MatchingRules'
import { AuthService } from './services/authService'

// Global styles to ensure the app takes up the full viewport
const globalStyles = (
  <GlobalStyles
    styles={{
      'html, body, #root': {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      },
      '#root': {
        display: 'flex',
        flexDirection: 'column',
      },
    }}
  />
);

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0',
    },
    secondary: {
      main: '#00796b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      textAlign: 'center',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      textAlign: 'center',
    },
    h4: {
      textAlign: 'center',
      fontWeight: 500,
    },
    h5: {
      textAlign: 'center',
    },
    h6: {
      textAlign: 'center',
    },
    body1: {
      textAlign: 'center',
    },
    body2: {
      textAlign: 'center',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '24px',
          margin: '0 auto',
          height: '100%',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

function App() {
  const [step, setStep] = useState(1)
  const [processedCSV, setProcessedCSV] = useState<ProcessedCSV | null>(null)
  const [checkImages, setCheckImages] = useState<ImageAnalysisResult[]>([])
  const [activeView, setActiveView] = useState<'process' | 'files' | 'rules'>('process')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string>('')

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    const handleResize = () => {
      // This function is kept for future window resize handling if needed
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCSVProcessed = (data: ProcessedCSV) => {
    setProcessedCSV(data)
    setStep(2)
  }

  const handleCheckImagesProcessed = (images: ImageAnalysisResult[]) => {
    setCheckImages(images)
    setStep(3)
  }

  const handleFinalProcessingComplete = () => {
    setStep(1)
    setProcessedCSV(null)
    setCheckImages([])
  }

  const handleNavigate = (newStep: number) => {
    setStep(newStep)
    setActiveView('process');
  }

  const handleViewChange = (view: 'process' | 'files' | 'rules') => {
    setActiveView(view);
    if (view === 'process') {
      // Reset to first step when switching to process view
      setStep(1);
    }
  }

  const handleSignInSuccess = (userInfo: any) => {
    const result = AuthService.validateAndStoreUser(userInfo);
    if (result.success) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError(result.error || 'Authentication failed');
    }
  };

  const handleSignInError = (error: string) => {
    setAuthError(error);
    setIsAuthenticated(false);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setAuthError('');
    // Reset app state
    setStep(1);
    setProcessedCSV(null);
    setCheckImages([]);
    setActiveView('process');
  };

  const renderContent = () => {
    if (activeView === 'files') {
      return <FileHistory />;
    } else if (activeView === 'rules') {
      return <MatchingRules />;
    } else {
      // Process view
      if (step === 1) {
        return <CSVUpload onCSVProcessed={handleCSVProcessed} />;
      } else if (step === 2) {
        return (
          <CheckImageUpload
            onImagesProcessed={handleCheckImagesProcessed}
            onBack={() => setStep(1)}
          />
        );
      } else if (step === 3) {
        return (
          <FinalProcessing
            processedCSV={processedCSV!}
            checkImages={checkImages}
            onComplete={handleFinalProcessingComplete}
            onBack={() => setStep(2)}
          />
        );
      }
    }
    return null;
  };

  // Check if Google Client ID is configured
  if (!googleClientId) {
    return (
      <ThemeProvider theme={theme}>
        {globalStyles}
        <CssBaseline />
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: theme.palette.background.default,
        }}>
          <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
            <div>Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.</div>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider theme={theme}>
        {globalStyles}
        <CssBaseline />

        {!isAuthenticated ? (
          <GoogleSignIn
            onSignInSuccess={handleSignInSuccess}
            onSignInError={handleSignInError}
            errorMessage={authError}
          />
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.default,
          }}>
            <AppMenu
              onNavigate={handleNavigate}
              currentStep={step}
              activeView={activeView}
              onViewChange={handleViewChange}
              onSignOut={handleSignOut}
            />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                height: `calc(100vh - 64px)`, // Subtract AppBar height
                overflow: 'auto', // Enable scrolling for content
                padding: { xs: 2, sm: 3, md: 4 },
                mt: '84px', // Increased margin-top to add more space (was 64px)
              }}
            >
              <Container
                maxWidth="lg"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: '100%',
                  flexGrow: 1,
                  py: 4,
                }}
              >
                {renderContent()}
              </Container>
            </Box>
          </Box>
        )}
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}

export default App
