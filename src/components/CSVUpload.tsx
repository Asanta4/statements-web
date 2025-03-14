import { useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { ProcessedCSV } from '../types';
import csvService from '../services/csvService';

interface CSVUploadProps {
  onCSVProcessed: (data: ProcessedCSV) => void;
}

const CSVUpload = ({ onCSVProcessed }: CSVUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      Papa.parse<any>(text, {
        header: true,
        complete: (results: Papa.ParseResult<any>) => {
          try {
            const processedData = csvService.processCSV(results.data);
            onCSVProcessed(processedData);
          } catch (err) {
            setError('Error processing CSV data: ' + (err as Error).message);
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error: Error) => {
          setError('Error parsing CSV file: ' + error.message);
          setIsProcessing(false);
        }
      });
    } catch (err) {
      setError('Error reading file: ' + (err as Error).message);
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Upload Bank Statement CSV
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Upload your bank statement CSV to begin processing. The system will automatically:
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 600, mx: 'auto', mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>• Remove "Account Running Balance" column</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>• Filter out rows with credit values</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>• Add "Check Name" and "Reason" columns</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>• Keep only rows with valid check numbers</Typography>
      </Box>
      
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mt: 2,
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
            <Typography>Processing CSV file...</Typography>
          </Box>
        ) : (
          <Typography>
            {isDragActive
              ? 'Drop the CSV file here'
              : 'Drag and drop a CSV file here, or click to select'}
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default CSVUpload; 