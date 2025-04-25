/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/common/EditableField.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditableField = ({
  label,                // Label for the TextField in edit mode AND display mode now
  value,                // The current value to display
  onSave,               // Async function to call when saving (receives new value)
  typographyVariant = "body1", // MUI Typography variant for display mode VALUE
  placeholder = "",     // Placeholder text (less relevant with label above)
  emptyText = "(Not set)", // Text to show when value is empty
  textFieldProps = {},  // Additional props for the TextField
  containerSx = {},     // Custom styles for the main container Box
  isSaving = false,     // Optional: Prop to disable buttons during save
  multiline = false,    // Optional: Use multiline TextField (though TextArea component preferred for this)
  rows = 1              // Optional: Rows for multiline TextField
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
    // Container - align items to the start (top) for label
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minHeight: '40px', width: '100%', ...containerSx }}>
      {!isEditing ? (
        // --- MODIFIED Display Mode ---
         <>
            <Box sx={{ flexGrow: 1 }}> {/* Box to hold label and value */}
                 {/* Display Label */}
                 <Typography
                    variant="caption" // Smaller variant for label
                    component="div"
                    sx={{ color: 'text.secondary', lineHeight: 1.2 }} // Adjust line height if needed
                >
                    {label}
                </Typography>
                 {/* Display Value */}
                 <Typography
                    variant={typographyVariant}
                    sx={{
                         color: !value ? 'text.secondary' : 'inherit',
                         // Apply word break for safety, although less likely needed for single-line fields
                         overflowWrap: 'break-word',
                         lineHeight: 1.4 // Adjust line height if needed
                    }}
                >
                     {/* Use value, fallback to emptyText. Placeholder less relevant here */}
                     {value || emptyText}
                 </Typography>
             </Box>
             {/* Edit Button */}
             <IconButton size="small" onClick={handleEditClick} aria-label={`Edit ${label}`} disabled={isSaving} sx={{mt: 0.5 /* Adjust vertical alignment if needed */}}>
                 <EditIcon fontSize="small" />
             </IconButton>
         </>
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
            autoFocus
            multiline={multiline}
            rows={multiline ? rows : 1}
            {...textFieldProps}
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