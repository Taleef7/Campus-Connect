/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/profile/ExperienceForm.jsx
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, CircularProgress, Box, FormHelperText, Alert
} from '@mui/material';
import { Timestamp } from 'firebase/firestore'; // Needed if handling Timestamps directly

// --- Helper Function to Format Dates for Input ---
// Converts Firestore Timestamp or Date object to 'YYYY-MM' for month input
const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed, pad for '05'
    return `${year}-${month}`;
  } catch (e) {
    console.error("Error formatting date for input:", e);
    return '';
  }
};

// --- Default State ---
const defaultState = {
  type: 'work', // Default type
  title: '',
  organization: '',
  startDate: '', // Stored as YYYY-MM string
  endDate: '',   // Stored as YYYY-MM string
  isCurrent: false,
  description: '',
  link: '',
};

const ExperienceForm = ({ open, onClose, onSave, initialData = null, userId, isSaving }) => {
  // --- State ---
  const [formData, setFormData] = useState(defaultState);
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState(''); // For errors not specific to a field

  // --- Effect to Reset Form ---
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Editing: Populate form with existing data
        setFormData({
          type: initialData.type || defaultState.type,
          title: initialData.title || defaultState.title,
          organization: initialData.organization || defaultState.organization,
          startDate: formatDateForInput(initialData.startDate),
          endDate: formatDateForInput(initialData.endDate),
          isCurrent: initialData.isCurrent || defaultState.isCurrent,
          description: initialData.description || defaultState.description,
          link: initialData.link || defaultState.link,
        });
      } else {
        // Adding new: Reset to default
        setFormData(defaultState);
      }
      // Clear errors when dialog opens/changes mode
      setFormErrors({});
      setGeneralError('');
    }
  }, [open, initialData]); // Rerun when dialog opens or initial data changes


  // --- Handlers ---
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // If 'isCurrent' is checked, clear the endDate
      ...(name === 'isCurrent' && checked && { endDate: '' }),
    }));
    // Clear specific error when user modifies field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    if(generalError) setGeneralError(''); // Clear general error on any change
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.type) errors.type = "Type is required.";
    if (!formData.title.trim()) errors.title = "Title is required.";
    if (!formData.organization.trim()) errors.organization = "Organization/Company/Project Name is required.";
    if (!formData.startDate) errors.startDate = "Start Date is required.";
    // Validate start date format (basic check)
    else if (!/^\d{4}-\d{2}$/.test(formData.startDate)) {
        errors.startDate = "Invalid date format (use YYYY-MM).";
    }

    // End date required only if not 'isCurrent'
    if (!formData.isCurrent && !formData.endDate) {
        errors.endDate = "End Date is required if not currently ongoing.";
    }
    // Validate end date format (basic check)
    else if (formData.endDate && !/^\d{4}-\d{2}$/.test(formData.endDate)) {
        errors.endDate = "Invalid date format (use YYYY-MM).";
    }
    // Optional: Validate date logic (end date must be after start date)
    else if (formData.startDate && formData.endDate && !formData.isCurrent) {
        try {
            const start = new Date(formData.startDate + '-01'); // Append day for Date object
            const end = new Date(formData.endDate + '-01');
            if (end < start) {
                errors.endDate = "End Date cannot be before Start Date.";
            }
        } catch (e) {
            errors.startDate = "Invalid date values for comparison."; // Handle potential Date parsing errors
        }
    }

    // Optional: Basic URL validation for link
    if (formData.link && !/^https?:\/\/.+/.test(formData.link)) {
        errors.link = "Please enter a valid URL (starting with http:// or https://).";
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0; // True if no errors
  };

  const handleSave = async () => {
    setGeneralError(''); // Clear previous general errors
    if (!validateForm()) return;
    if (!userId) {
        setGeneralError("User ID is missing. Cannot save.");
        return;
    }

    // --- Prepare data for saving ---
    // Convert YYYY-MM strings back to Firestore Timestamps (or Date objects)
    // Store as the *first day* of the given month.
    let startTimestamp = null;
    let endTimestamp = null;

    try {
        if (formData.startDate) {
            // Add '-01' to make it a valid date string for Date constructor
            startTimestamp = Timestamp.fromDate(new Date(formData.startDate + '-01'));
        }
        if (formData.endDate && !formData.isCurrent) {
            endTimestamp = Timestamp.fromDate(new Date(formData.endDate + '-01'));
        }
    } catch (e) {
        console.error("Error converting dates to Timestamps:", e);
        setGeneralError("Invalid date format encountered. Please check dates.");
        return; // Stop saving if date conversion fails
    }


    const experienceData = {
      type: formData.type,
      title: formData.title.trim(),
      organization: formData.organization.trim(),
      startDate: startTimestamp, // Use the Timestamp
      isCurrent: formData.isCurrent,
      description: formData.description.trim(),
      link: formData.link.trim(),
      // Only include endDate if it's valid and not current
      ...(endTimestamp && !formData.isCurrent && { endDate: endTimestamp }),
    };

    // Add or remove endDate based on isCurrent
    if (formData.isCurrent) {
        delete experienceData.endDate; // Ensure endDate is not present if current
    }

    // Call the passed-in onSave function (which handles Firestore)
    try {
      await onSave(experienceData, initialData?.id || null); // Pass data and ID (if editing)
      // onClose(); // Optionally close dialog on successful save (handled by parent potentially)
    } catch (error) {
        console.error("Error saving experience:", error);
        setGeneralError(`Failed to save experience: ${error.message}`);
    }
  };


  // --- Render ---
  return (
    // Prevent closing while saving action is in progress
    <Dialog open={open} onClose={() => !isSaving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
      <DialogContent>
        {generalError && <Alert severity="error" sx={{ mb: 2 }}>{generalError}</Alert>}

        {/* --- FORM FIELDS (Add below) --- */}
        <Box component="form" noValidate autoComplete="off">
            {/* Type (Dropdown) */}
            <FormControl fullWidth margin="dense" required error={!!formErrors.type} disabled={isSaving}>
                <InputLabel id="experience-type-label">Type</InputLabel>
                <Select
                    labelId="experience-type-label"
                    name="type"
                    value={formData.type}
                    label="Type"
                    onChange={handleChange}
                >
                    <MenuItem value="work">Work Experience</MenuItem>
                    <MenuItem value="research">Research Experience</MenuItem>
                    <MenuItem value="project">Project</MenuItem>
                    <MenuItem value="volunteer">Volunteer</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    {/* Add other relevant types if needed */}
                </Select>
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
            </FormControl>

             {/* Title */}
            <TextField
                margin="dense"
                name="title"
                label="Title / Role"
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

             {/* Organization / Company / Project Name */}
             <TextField
                margin="dense"
                name="organization"
                label="Organization / Company / Project Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.organization}
                onChange={handleChange}
                required
                error={!!formErrors.organization}
                helperText={formErrors.organization}
                disabled={isSaving}
            />

            {/* Dates */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                 {/* Start Date */}
                <TextField
                    margin="dense"
                    name="startDate"
                    label="Start Date"
                    type="month" // Use month input type
                    fullWidth
                    variant="outlined"
                    value={formData.startDate} // Should be YYYY-MM
                    onChange={handleChange}
                    required
                    error={!!formErrors.startDate}
                    helperText={formErrors.startDate || "YYYY-MM"}
                    disabled={isSaving}
                    InputLabelProps={{
                        shrink: true, // Keep label floated
                    }}
                />
                 {/* End Date */}
                <TextField
                    margin="dense"
                    name="endDate"
                    label="End Date"
                    type="month"
                    fullWidth
                    variant="outlined"
                    value={formData.endDate} // Should be YYYY-MM
                    onChange={handleChange}
                    required={!formData.isCurrent} // Required only if not current
                    error={!!formErrors.endDate}
                    helperText={formErrors.endDate || "YYYY-MM"}
                    disabled={isSaving || formData.isCurrent} // Disable if saving OR if 'isCurrent' is checked
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Box>

            {/* Currently Working Checkbox */}
            <FormControlLabel
                control={
                    <Checkbox
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleChange}
                    color="primary"
                    disabled={isSaving}
                    />
                }
                label="I am currently working / involved in this role"
                sx={{ mt: 1, display: 'block' }} // Ensure it takes full width block
            />

             {/* Description */}
             <TextField
                margin="dense"
                name="description"
                label="Description (Optional)"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                disabled={isSaving}
            />

             {/* Link */}
             <TextField
                margin="dense"
                name="link"
                label="Related Link (Optional)"
                type="url" // Use URL type for better semantics/validation
                fullWidth
                variant="outlined"
                value={formData.link}
                onChange={handleChange}
                error={!!formErrors.link}
                helperText={formErrors.link || "e.g., https://project-link.com"}
                disabled={isSaving}
            />

        </Box>

      </DialogContent>
      <DialogActions sx={{ p: '16px 24px'}}>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} color="inherit"/> : (initialData ? 'Update Experience' : 'Add Experience')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExperienceForm;