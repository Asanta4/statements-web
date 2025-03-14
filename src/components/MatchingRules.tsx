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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { ReasonMapping } from '../types';

// Import the initial mappings from a central location
import { REASON_MAPPINGS } from '../data/reasonMappings';

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

  useEffect(() => {
    // In a real app, this would fetch from an API or local storage
    setMappings(REASON_MAPPINGS);
    setFilteredMappings(REASON_MAPPINGS);
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
    setMappings(mappings.filter(mapping => mapping.searchTerm !== searchTerm));
  };

  const handleSaveEdit = () => {
    if (currentMapping && editedSearchTerm && editedReason) {
      const updatedMappings = mappings.map(mapping => 
        mapping.searchTerm === currentMapping.searchTerm
          ? { searchTerm: editedSearchTerm, reason: editedReason }
          : mapping
      );
      setMappings(updatedMappings);
      setEditDialogOpen(false);
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
      // Check if the search term already exists
      const exists = mappings.some(mapping => 
        mapping.searchTerm.toLowerCase() === newSearchTerm.toLowerCase()
      );

      if (!exists) {
        const newMapping: ReasonMapping = {
          searchTerm: newSearchTerm,
          reason: newReason
        };
        
        setMappings([...mappings, newMapping]);
        setAddDialogOpen(false);
      } else {
        // In a real app, you would show an error message
        alert('A rule with this search term already exists');
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
    </Container>
  );
};

export default MatchingRules; 