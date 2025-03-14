import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Container,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProcessedFile {
  id: string;
  name: string;
  originalName: string; // Original file name as downloaded by the user
  date: string;
  size: string;
}

// Mock data for demonstration
const mockFiles: ProcessedFile[] = [
  {
    id: '1',
    name: 'bank_statement_jan_2023.csv',
    originalName: 'modified_statement_jan_2023.csv',
    date: '2023-01-15',
    size: '45 KB',
  },
  {
    id: '2',
    name: 'bank_statement_feb_2023.csv',
    originalName: 'modified_statement_feb_2023.csv',
    date: '2023-02-12',
    size: '52 KB',
  },
  {
    id: '3',
    name: 'bank_statement_mar_2023.csv',
    originalName: 'modified_statement_mar_2023.csv',
    date: '2023-03-10',
    size: '48 KB',
  },
  {
    id: '4',
    name: 'bank_statement_apr_2023.csv',
    originalName: 'modified_statement_apr_2023.csv',
    date: '2023-04-08',
    size: '51 KB',
  },
  {
    id: '5',
    name: 'bank_statement_may_2023.csv',
    originalName: 'modified_statement_may_2023.csv',
    date: '2023-05-14',
    size: '49 KB',
  },
  {
    id: '6',
    name: 'bank_statement_jun_2023.csv',
    originalName: 'modified_statement_jun_2023.csv',
    date: '2023-06-11',
    size: '53 KB',
  },
  {
    id: '7',
    name: 'bank_statement_jul_2023.csv',
    originalName: 'modified_statement_jul_2023.csv',
    date: '2023-07-09',
    size: '47 KB',
  },
];

const FileHistory = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from an API or local storage
    setFiles(mockFiles);
  }, []);

  const handleDownload = (fileId: string) => {
    // In a real app, this would trigger a file download
    console.log(`Downloading file with ID: ${fileId}`);
    alert(`Downloading file (mock): ${fileId}`);
  };

  const handleDelete = (fileId: string) => {
    // Remove the file from the list
    setFiles(files.filter(file => file.id !== fileId));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          File History
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Previously processed files are stored for 30 days
        </Typography>

        {files.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No files in history
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            <List>
              {files.map((file, index) => (
                <Box key={file.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={file.originalName}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Original: {file.name}
                          </Typography>
                          <br />
                          {`Processed: ${file.date} • Size: ${file.size}`}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="download"
                        onClick={() => handleDownload(file.id)}
                        sx={{ mr: 1 }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDelete(file.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Box>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default FileHistory; 