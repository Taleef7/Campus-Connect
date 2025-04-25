/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/common/EditableTextArea.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditableTextArea = ({
  label,                // Label for the TextField in edit mode AND display mode now
  value,                // The current value to display
  onSave,               // Async function to call when saving (receives new value)
  typographyVariant = "body2", // MUI Typography variant for display mode VALUE
  placeholder = "(Not provided)", // Placeholder text when value is empty
  emptyText = "(Not provided)", // Text to show when value is truly empty
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
      await onSave(inputValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error(`Error saving ${label}:`, error);
    }
  };

  return (
    // Container remains largely the same
    <Box sx={{ width: '100%', position: 'relative', ...containerSx }}>
      {!isEditing ? (
        // --- MODIFIED Display Mode ---
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}> {/* Align items start for label */}
            <Box sx={{ flexGrow: 1 }}> {/* Box to hold label and value */}
                {/* Display Label */}
                <Typography
                    variant="caption" // Smaller variant for label
                    component="div" // Use div to prevent potential nesting issues
                    sx={{ color: 'text.secondary', mb: 0.25 }} // Style as needed
                >
                    {label}
                </Typography>
                {/* Display Value */}
                <Typography
                    variant={typographyVariant}
                    sx={{
                        whiteSpace: 'pre-wrap',    // Keep line breaks
                        // overflowWrap: 'break-word', // *** ADDED: Fix text overflow ***
                        wordBreak: 'break-all',      // <<< TRY THIS INSTEAD
                        color: !value ? 'text.secondary' : 'inherit',
                        minHeight: '20px' // Ensure some min height even if empty
                    }}
                >
                    {value?.trim() || placeholder || emptyText} {/* Show value or placeholder */}
                </Typography>
            </Box>
            {/* Edit Button - aligns to the right */}
             <IconButton
                size="small"
                onClick={handleEditClick}
                aria-label={`Edit ${label}`}
                sx={{ mt: 2 }} // Adjust margin if needed based on label size
                disabled={isSaving}
            >
                 <EditIcon fontSize="small" />
             </IconButton>
        </Box>
        // --- END MODIFIED Display Mode ---
      ) : (
        // --- Edit Mode (No Change Needed Here) ---
        <>
          <TextField
            label={label}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            fullWidth
            multiline
            rows={rows}
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