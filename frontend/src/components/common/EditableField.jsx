/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/common/EditableField.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditableField = ({
  label,                // Label for the TextField in edit mode
  value,                // The current value to display
  onSave,               // Async function to call when saving (receives new value)
  typographyVariant = "body1", // MUI Typography variant for display mode
  placeholder = "",     // Placeholder text when value is empty in display mode
  emptyText = "(Not set)", // Text to show when value is empty
  textFieldProps = {},  // Additional props for the TextField (e.g., { size: 'small' })
  containerSx = {},     // Custom styles for the main container Box
  isSaving = false,     // Optional: Prop to disable buttons during save
  multiline = false,    // Optional: Use multiline TextField
  rows = 1              // Optional: Rows for multiline TextField
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || ''); // Initialize with value

  // Update internal input value if the external value prop changes (e.g., after save)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleEditClick = () => {
    setInputValue(value || ''); // Reset input to current value on edit start
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setInputValue(value || ''); // Reset input value on cancel
  };

  const handleSaveClick = async () => {
    // Basic check: only save if value changed (optional)
    // if (inputValue.trim() === (value || '').trim()) {
    //     setIsEditing(false);
    //     return;
    // }
    try {
      await onSave(inputValue.trim()); // Call the async save function from props
      setIsEditing(false); // Exit edit mode on successful save
    } catch (error) {
      console.error(`Error saving ${label}:`, error);
      // Optionally handle error display here or let the parent handle it
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '40px', width: '100%', ...containerSx }}>
      {!isEditing ? (
        // Display Mode
        <>
          <Typography variant={typographyVariant} sx={{ flexGrow: 1, color: !value ? 'text.secondary' : 'inherit' }}>
            {value || placeholder || emptyText}
          </Typography>
          <IconButton size="small" onClick={handleEditClick} aria-label={`Edit ${label}`} disabled={isSaving}>
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
            autoFocus
            multiline={multiline}
            rows={multiline ? rows : 1}
            {...textFieldProps} // Spread additional TextField props
            disabled={isSaving}
          />
          <IconButton size="small" onClick={handleSaveClick} color="success" aria-label={`Save ${label}`} disabled={isSaving}>
            <CheckIcon />
          </IconButton>
          <IconButton size="small" onClick={handleCancelClick} color="error" aria-label={`Cancel ${label} edit`} disabled={isSaving}>
            <CloseIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default EditableField;