import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import { ProcessedCSV, ImageAnalysisResult } from '../types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import csvService from '../services/csvService';
import { REASON_MAPPINGS } from '../data/reasonMappings';

interface FinalProcessingProps {
  processedCSV: ProcessedCSV;
  checkImages: ImageAnalysisResult[];
  onComplete: () => void;
  onBack: () => void;
}

const FinalProcessing = ({
  processedCSV,
  checkImages,
  onComplete,
  onBack,
}: FinalProcessingProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchSummary, setMatchSummary] = useState<{
    matched: number;
    unmatched: number;
    withReason: number;
  }>({ matched: 0, unmatched: 0, withReason: 0 });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Calculate initial match summary
    const matched = processedCSV.rows.filter(row => 
      checkImages.some(img => img.checkNumber === row.checkNumber)
    ).length;
    
    setMatchSummary({
      matched,
      unmatched: processedCSV.rows.length - matched,
      withReason: 0 // Will be calculated during processing
    });
  }, [processedCSV, checkImages]);

  const processFinalCSV = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Use the CSV service to generate the final CSV
      const csvContent = csvService.generateFinalCSV(
        processedCSV,
        checkImages,
        REASON_MAPPINGS
      );

      // Calculate how many rows got reasons assigned
      const withReasonCount = processedCSV.rows.filter(row => {
        const reason = csvService.assignReason(
          row.description,
          row.checkName || '',
          REASON_MAPPINGS
        );
        return reason !== '';
      }).length;

      setMatchSummary(prev => ({
        ...prev,
        withReason: withReasonCount
      }));

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modified_statement.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      
      // Wait a moment before completing
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err) {
      setError('Error processing final CSV: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Final Processing
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{processedCSV.rows.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Rows</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{checkImages.length}</Typography>
            <Typography variant="body2" color="text.secondary">Check Images</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{matchSummary.matched}</Typography>
            <Typography variant="body2" color="text.secondary">Matched Checks</Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Check #</TableCell>
                <TableCell>Check Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checkImages.slice(0, 5).map((image) => {
                const isMatched = processedCSV.rows.some(
                  row => row.checkNumber === image.checkNumber
                );
                return (
                  <TableRow key={image.checkNumber}>
                    <TableCell>{image.checkNumber}</TableCell>
                    <TableCell>{image.checkName}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        label={isMatched ? "Matched" : "Not Found"} 
                        color={isMatched ? "success" : "error"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {checkImages.length > 5 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {checkImages.length - 5} more check images...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            CSV processed successfully! Redirecting to start...
          </Alert>
        )}

        {isProcessing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4 }}>
            <CircularProgress />
            <Typography>Processing final CSV...</Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={processFinalCSV}
            sx={{ mt: 2 }}
            startIcon={<DownloadIcon />}
            disabled={success}
          >
            Process and Download CSV
          </Button>
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

export default FinalProcessing; 