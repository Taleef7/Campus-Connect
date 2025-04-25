import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControlLabel, Checkbox
} from '@mui/material';

const opportunityTypes = [
  'Research Assistant',
  'Teaching Assistant',
  'Internship',
  'Volunteer',
  'Grader',
  'Other'
];

const AddOpportunityForm = ({ open, onClose, onSave, professorId, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allowInterest, setAllowInterest] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || '');
      setDeadline(initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '');
      setAllowInterest(initialData.allowInterest ?? true);
    } else {
      setTitle('');
      setDescription('');
      setType('');
      setDeadline('');
      setAllowInterest(true);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!title || !description || !type) {
      alert('Please fill out all required fields.');
      return;
    }

    const data = {
      title,
      description,
      type,
      allowInterest,
      deadline: deadline ? new Date(deadline) : null,
      id: initialData?.id || undefined
    };

    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Opportunity' : 'Create New Opportunity Post'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="dense"
          label="Opportunity Title *"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description *"
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Type *"
          fullWidth
          select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {opportunityTypes.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField
          margin="dense"
          label="Application Deadline (Optional)"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={allowInterest}
              onChange={(e) => setAllowInterest(e.target.checked)}
            />
          }
          label="Allow students to mark themselves as 'Interested'"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Create'} Post
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOpportunityForm;
