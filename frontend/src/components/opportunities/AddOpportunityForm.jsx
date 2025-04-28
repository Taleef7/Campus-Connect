/* eslint-disable react/prop-types */
// frontend/src/components/opportunities/AddOpportunityForm.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, FormHelperText, CircularProgress
} from '@mui/material';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

const AddOpportunityForm = ({ open, onClose, onSave, initialData = null, isSaving }) => {
  // Initialize form state: Use initialData if editing, otherwise default empty values
  const getInitialState = useCallback(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'TA', // Default type
    allowInterest: initialData?.allowInterest !== undefined ? initialData.allowInterest : true, // Default to allowing interest
    deadline: initialData?.deadline ? initialData.deadline.toDate().toISOString().split('T')[0] : '', // Format for date input
    // Add other fields from your data model as needed
  }), [initialData]);

  const [formData, setFormData] = useState(getInitialState());
  const [formErrors, setFormErrors] = useState({});

  // Reset form when initialData changes (when opening for edit) or when dialog closes/opens
  useEffect(() => {
    if (open) {
        setFormData(getInitialState());
        setFormErrors({}); // Clear errors when dialog opens
    }
  }, [getInitialState, initialData, open]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear specific error when user starts typing
    if (formErrors[name]) {
        setFormErrors(prev => ({...prev, [name]: null}));
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.title.trim()) errors.title = "Title is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (!formData.type) errors.type = "Opportunity type is required.";
    // Basic date validation (doesn't prevent past dates, add more if needed)
    if (formData.deadline && isNaN(Date.parse(formData.deadline))) {
        errors.deadline = "Invalid date format.";
    }
    // Add more validation as needed (e.g., date format)
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Convert deadline string back to Timestamp if needed
    let deadlineTimestamp = null;
    if (formData.deadline) {
        try {
            // Attempt to create a date object at the beginning of the selected day in local time
            const dateParts = formData.deadline.split('-');
            const utcDate = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
            if (isNaN(utcDate.getTime())) { // Check if date is valid
                throw new Error("Invalid date components");
             }
            deadlineTimestamp = Timestamp.fromDate(utcDate);
        } catch (dateError) {
            console.error("Error parsing date:", dateError);
            setFormErrors(prev => ({...prev, deadline: "Invalid date format."}));
            return; // Stop save if date is invalid
        }
    }


    // Prepare data to save (exclude deadline if empty)
    const dataToSave = {
        ...formData,
        ...(deadlineTimestamp && { deadline: deadlineTimestamp }) // Only include deadline if it's valid
    };
     if (!formData.deadline) {
        delete dataToSave.deadline; // Ensure deadline field is not sent if empty
    }


    onSave(dataToSave); // Pass the processed data to the parent save handler
  };

  return (
    <Dialog open={open} onClose={() => !isSaving && onClose()} maxWidth="sm" fullWidth data-testid="opportunity-form-dialog"> {/* Prevent closing while saving */}
      <DialogTitle>{initialData ? 'Edit Opportunity Post' : 'Create New Opportunity Post'}</DialogTitle>
      <DialogContent>
        <TextField
          data-testid="opportunity-title-input" // <<< ADDED
          autoFocus
          margin="dense"
          name="title"
          label="Opportunity Title"
          type="text"
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
          data-testid="opportunity-description-input" // <<< ADDED
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange}
          required
          error={!!formErrors.description}
          helperText={formErrors.description}
          disabled={isSaving}
        />
        <FormControl data-testid="opportunity-type-select" fullWidth margin="dense" required error={!!formErrors.type} disabled={isSaving}>
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
          data-testid="opportunity-deadline-input"
          margin="dense"
          name="deadline"
          label="Application Deadline (Optional)"
          type="date" // Use date input type
          fullWidth
          variant="outlined"
          value={formData.deadline}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }} // Keep label floated
          error={!!formErrors.deadline}
          helperText={formErrors.deadline}
          disabled={isSaving}
        />
        <FormControlLabel
          control={
            <Checkbox
              data-testid="opportunity-allow-interest-checkbox"
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
        <Button data-testid="opportunity-form-cancel-button" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button data-testid="opportunity-form-save-button" onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : (initialData ? 'Update Post' : 'Create Post')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOpportunityForm;