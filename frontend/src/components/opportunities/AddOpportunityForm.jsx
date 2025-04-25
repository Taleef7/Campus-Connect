// frontend/src/components/opportunities/AddOpportunityForm.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, FormHelperText, CircularProgress
} from '@mui/material';
import { Timestamp } from 'firebase/firestore';

const AddOpportunityForm = ({ open, onClose, onSave, initialData = null, isSaving }) => {
  const getInitialState = useCallback(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'TA',
    allowInterest: initialData?.allowInterest !== undefined ? initialData.allowInterest : true,
    deadline: initialData?.deadline ? initialData.deadline.toDate().toISOString().split('T')[0] : '',
  }), [initialData]);

  const [formData, setFormData] = useState(getInitialState());
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData(getInitialState());
      setFormErrors({});
    }
  }, [open, getInitialState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (!formData.type) errors.type = "Type is required.";
    if (formData.deadline && isNaN(Date.parse(formData.deadline))) {
      errors.deadline = "Invalid deadline date.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    let deadlineTimestamp = null;
    if (formData.deadline) {
      try {
        const dateParts = formData.deadline.split('-');
        const utcDate = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
        if (isNaN(utcDate.getTime())) throw new Error("Invalid date");
        deadlineTimestamp = Timestamp.fromDate(utcDate);
      } catch (err) {
        console.error("Invalid deadline format:", err);
        setFormErrors(prev => ({ ...prev, deadline: "Invalid deadline format." }));
        return;
      }
    }

    const dataToSave = {
      ...formData,
      ...(deadlineTimestamp && { deadline: deadlineTimestamp }),
    };

    if (!formData.deadline) {
      delete dataToSave.deadline;
    }

    onSave(dataToSave); // ✅ Correctly triggers save back to ProfessorDashboard
  };

  return (
    <Dialog open={open} onClose={() => !isSaving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Opportunity Post' : 'Create New Opportunity Post'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Opportunity Title"
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={handleChange}
          required
          error={!!formErrors.title}
          helperText={formErrors.title}
          disabled={isSaving}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={formData.description}
          onChange={handleChange}
          required
          error={!!formErrors.description}
          helperText={formErrors.description}
          disabled={isSaving}
        />
        <FormControl fullWidth margin="dense" required error={!!formErrors.type} disabled={isSaving}>
          <InputLabel id="opportunity-type-label">Type</InputLabel>
          <Select
            labelId="opportunity-type-label"
            name="type"
            value={formData.type}
            label="Type"
            onChange={handleChange}
          >
            <MenuItem value="TA">TA</MenuItem>
            <MenuItem value="Research Assistant">Research Assistant</MenuItem>
            <MenuItem value="Grader">Grader</MenuItem>
            <MenuItem value="Lab Assistant">Lab Assistant</MenuItem>
            <MenuItem value="Job">Job</MenuItem>
            <MenuItem value="Volunteer">Volunteer</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
        </FormControl>
        <TextField
          margin="dense"
          name="deadline"
          label="Application Deadline (Optional)"
          type="date"
          fullWidth
          variant="outlined"
          value={formData.deadline}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          error={!!formErrors.deadline}
          helperText={formErrors.deadline}
          disabled={isSaving}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="allowInterest"
              checked={formData.allowInterest}
              onChange={handleChange}
              color="primary"
              disabled={isSaving}
            />
          }
          label="Allow students to mark themselves as 'Interested'"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : (initialData ? 'Update Post' : 'Create Post')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOpportunityForm;
