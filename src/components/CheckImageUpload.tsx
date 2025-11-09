import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Stack,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ImageAnalysisResult } from '../types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import gptService from '../services/gptService';

interface CheckImageUploadProps {
  onImagesProcessed: (images: ImageAnalysisResult[]) => void;
  onBack: () => void;
}

const CheckImageUpload = ({ onImagesProcessed, onBack }: CheckImageUploadProps) => {
  const [images, setImages] = useState<ImageAnalysisResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const analyzeImage = async (file: File): Promise<ImageAnalysisResult> => {
    try {
      const result = await gptService.analyzeCheckImage(file);
      
      // Show success message if we got valid data
      if (result.checkNumber || result.checkName) {
        setSnackbarMessage('Image analyzed successfully');
        setSnackbarOpen(true);
      }
      
      return result;
    } catch (err) {
      console.error('Error analyzing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Show error in snackbar
      setSnackbarMessage(`Analysis error: ${errorMessage}`);
      setSnackbarOpen(true);
      
      // Fallback to a basic result if analysis fails
      return {
        checkNumber: '',
        checkName: '',
        imageUrl: URL.createObjectURL(file),
        error: errorMessage
      };
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 100) {
      setError('Maximum 100 images allowed');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingProgress({ current: 0, total: acceptedFiles.length });

    try {
      // Process images sequentially to avoid overwhelming the API
      const results: ImageAnalysisResult[] = [];
      
      for (let i = 0; i < acceptedFiles.length; i++) {
        setIsAnalyzing(true);
        setProcessingProgress({ current: i + 1, total: acceptedFiles.length });
        
        const result = await analyzeImage(acceptedFiles[i]);
        results.push(result);
        
        setIsAnalyzing(false);
      }
      
      setImages(results);
      setCurrentIndex(0);
    } catch (err) {
      setError('Error processing images: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 100
  });

  const handleCheckNameChange = (value: string) => {
    const newImages = [...images];
    newImages[currentIndex] = {
      ...newImages[currentIndex],
      checkName: value
    };
    setImages(newImages);
  };

  const handleCheckNumberChange = (value: string) => {
    const newImages = [...images];
    newImages[currentIndex] = {
      ...newImages[currentIndex],
      checkNumber: value
    };
    setImages(newImages);
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // We're on the last image and clicking "Finish"
      onImagesProcessed(images);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const isLastImage = currentIndex === images.length - 1;
  const currentImage = images[currentIndex];
  const hasError = currentImage?.error ? true : false;

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Upload Check Images
        </Typography>
      </Box>

      {images.length === 0 ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            mt: 4,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              {isAnalyzing && (
                <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(processingProgress.current / processingProgress.total) * 100} 
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {Math.round((processingProgress.current / processingProgress.total) * 100)}%
                  </Typography>
                </Box>
              )}
              <Typography>
                {isAnalyzing 
                  ? `Analyzing image ${processingProgress.current} of ${processingProgress.total} with GPT-4o...` 
                  : 'Processing images...'}
              </Typography>
            </Box>
          ) : (
            <Typography>
              {isDragActive
                ? 'Drop the check images here'
                : 'Drag and drop check images here, or click to select (max 100)'}
            </Typography>
          )}
        </Paper>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <img
              src={images[currentIndex].imageUrl}
              alt={`Check ${currentIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </Paper>

          {currentImage?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error analyzing this image: {currentImage.error}
            </Alert>
          )}

          <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                label="Check Number"
                value={images[currentIndex].checkNumber}
                onChange={(e) => handleCheckNumberChange(e.target.value)}
                fullWidth
                placeholder="Enter check number"
                helperText="The number in the top-right corner of the check"
                error={hasError}
              />
              <Tooltip title="Edit if the AI didn't get it right">
                <IconButton sx={{ mt: 1, ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                label="Check Name"
                value={images[currentIndex].checkName}
                onChange={(e) => handleCheckNameChange(e.target.value)}
                fullWidth
                placeholder="Enter payee name"
                helperText="The name after 'Pay to the order of'"
                error={hasError}
              />
              <Tooltip title="Edit if the AI didn't get it right">
                <IconButton sx={{ mt: 1, ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              startIcon={<ArrowBackIcon />}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              color={isLastImage ? "success" : "primary"}
              endIcon={isLastImage ? <CheckIcon /> : <ArrowForwardIcon />}
            >
              {isLastImage ? "Finish" : "Next"}
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Image {currentIndex + 1} of {images.length}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default CheckImageUpload; 
