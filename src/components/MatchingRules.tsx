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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  Fab,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { ReasonMapping } from '../types';

// Import storage service for persistence
import {
  getMatchingRules,
  addMatchingRule,
  updateMatchingRule,
  deleteMatchingRule,
} from '../services/storageService';

const MatchingRules = () => {
  const [mappings, setMappings] = useState<ReasonMapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<ReasonMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentMapping, setCurrentMapping] = useState<ReasonMapping | null>(null);
  const [editedSearchTerm, setEditedSearchTerm] = useState('');
  const [editedReason, setEditedReason] = useState('');
  const [newSearchTerm, setNewSearchTerm] = useState('');
  const [newReason, setNewReason] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Load matching rules from storage
    try {
      const storedMappings = getMatchingRules();
      setMappings(storedMappings);
      setFilteredMappings(storedMappings);
    } catch (error) {
      console.error('Error loading matching rules:', error);
      showSnackbar('Error loading matching rules', 'error');
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mappings.filter(
        mapping => 
          mapping.searchTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mapping.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMappings(filtered);
    } else {
      setFilteredMappings(mappings);
    }
  }, [searchTerm, mappings]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (mapping: ReasonMapping) => {
    setCurrentMapping(mapping);
    setEditedSearchTerm(mapping.searchTerm);
    setEditedReason(mapping.reason);
    setEditDialogOpen(true);
  };

  const handleDelete = (searchTerm: string) => {
    try {
      const updatedMappings = deleteMatchingRule(searchTerm);
      setMappings(updatedMappings);
      showSnackbar('Rule deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting rule:', error);
      showSnackbar('Error deleting rule', 'error');
    }
  };

  const handleSaveEdit = () => {
    if (currentMapping && editedSearchTerm && editedReason) {
      try {
        const updatedRule: ReasonMapping = {
          searchTerm: editedSearchTerm,
          reason: editedReason
        };
        const updatedMappings = updateMatchingRule(currentMapping.searchTerm, updatedRule);
        setMappings(updatedMappings);
        setEditDialogOpen(false);
        showSnackbar('Rule updated successfully', 'success');
      } catch (error) {
        console.error('Error updating rule:', error);
        showSnackbar(error instanceof Error ? error.message : 'Error updating rule', 'error');
      }
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
  };

  const handleOpenAddDialog = () => {
    setNewSearchTerm('');
    setNewReason('');
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  const handleAddRule = () => {
    if (newSearchTerm && newReason) {
      try {
        const newMapping: ReasonMapping = {
          searchTerm: newSearchTerm,
          reason: newReason
        };
        
        const updatedMappings = addMatchingRule(newMapping);
        setMappings(updatedMappings);
        setAddDialogOpen(false);
        showSnackbar('Rule added successfully', 'success');
      } catch (error) {
        console.error('Error adding rule:', error);
        showSnackbar(error instanceof Error ? error.message : 'Error adding rule', 'error');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Matching Rules
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          These rules determine how transactions are categorized
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search rules..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Add new rule">
            <Fab 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }}
              onClick={handleOpenAddDialog}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>

        {filteredMappings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No matching rules found
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            <List>
              {filteredMappings.map((mapping, index) => (
                <Box key={mapping.searchTerm}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={mapping.searchTerm}
                      secondary={`Reason: ${mapping.reason}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleEdit(mapping)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDelete(mapping.searchTerm)}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Edit Matching Rule</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Check Name / Description"
            type="text"
            fullWidth
            variant="outlined"
            value={editedSearchTerm}
            onChange={(e) => setEditedSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Enter text to match in check name or transaction description"
          />
          <TextField
            margin="dense"
            label="Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={editedReason}
            onChange={(e) => setEditedReason(e.target.value)}
            helperText="The reason to assign when this rule matches"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={!editedSearchTerm || !editedReason}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Matching Rule</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Check Name / Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newSearchTerm}
            onChange={(e) => setNewSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Enter text to match in check name or transaction description"
          />
          <TextField
            margin="dense"
            label="Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            helperText="The reason to assign when this rule matches"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddRule} 
            variant="contained"
            disabled={!newSearchTerm || !newReason}
          >
            Add Rule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MatchingRules;