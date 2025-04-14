/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/common/EditableTextArea.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditableTextArea = ({
  label,                // Label for the TextField in edit mode
  value,                // The current value to display
  onSave,               // Async function to call when saving (receives new value)
  typographyVariant = "body2", // MUI Typography variant for display mode
  placeholder = "(No description provided)", // Placeholder text when value is empty
  emptyText = "(Not set)", // Text to show when value is truly empty (can be same as placeholder)
  textFieldProps = {},  // Additional props for the TextField
  containerSx = {},     // Custom styles for the main container Box
  isSaving = false,     // Optional: Prop to disable buttons during save
  rows = 4              // Default rows for the text area
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleEditClick = () => {
    setInputValue(value || '');
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setInputValue(value || '');
  };

  const handleSaveClick = async () => {
    try {
      await onSave(inputValue.trim()); // Pass trimmed value to save function
      setIsEditing(false);
    } catch (error) {
      console.error(`Error saving ${label}:`, error);
    }
  };

  return (
    <Box sx={{ width: '100%', ...containerSx }}>
      {!isEditing ? (
        // Display Mode
        <>
          <Typography variant={typographyVariant} sx={{ whiteSpace: 'pre-wrap', color: !value ? 'text.secondary' : 'inherit' }}>
            {value || placeholder || emptyText}
          </Typography>
          <IconButton size="small" onClick={handleEditClick} aria-label={`Edit ${label}`} sx={{ mt: 1 }} disabled={isSaving}>
            <EditIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        // Edit Mode
        <>
          <TextField
            label={label}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            fullWidth
            multiline // Key difference: multiline is true
            rows={rows} // Use rows prop
            autoFocus
            {...textFieldProps}
            disabled={isSaving}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton size="small" onClick={handleSaveClick} color="success" aria-label={`Save ${label}`} disabled={isSaving}>
              <CheckIcon />
            </IconButton>
            <IconButton size="small" onClick={handleCancelClick} color="error" aria-label={`Cancel ${label} edit`} disabled={isSaving}>
              <CloseIcon />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditableTextArea;