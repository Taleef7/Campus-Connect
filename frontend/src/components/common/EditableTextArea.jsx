/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/common/EditableTextArea.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditableTextArea = ({
  testIdPrefix,
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

  // Helper function to generate test ID only if prefix is provided
  const addTestId = (suffix) => (testIdPrefix ? { [`data-testid`]: `${testIdPrefix}-${suffix}` } : {});

  return (
    // Container remains largely the same
    <Box sx={{ width: '100%', position: 'relative', ...containerSx }} {...addTestId('container')}>
      {!isEditing ? (
        // Display Mode
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 0.25 }}>
                    {label}
                </Typography>
                <Typography
                    variant={typographyVariant} // This variant is passed as a prop
                    sx={{
                        whiteSpace: 'pre-wrap',      // Keep line breaks
                        // --- MODIFY WORD BREAKING ---
                        // overflowWrap: 'break-word',  // Use this instead of break-all
                        wordBreak: 'break-word',     // Alternative to overflow-wrap
                        hyphens: 'auto',             // <<< ADD THIS FOR HYPHENATION
                        // --- END MODIFICATION ---
                        color: !value ? 'text.secondary' : 'inherit',
                        minHeight: '20px'
                    }}
                    {...addTestId('display')}
                >
                    {value?.trim() || placeholder || emptyText}
                </Typography>
            </Box>
            <IconButton size="small" onClick={handleEditClick} /* ... other props ... */ sx={{ mt: 1 }} {...addTestId('edit-button')}>
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
            {...addTestId('input-wrapper')} // <<< ADDED TEST ID FOR TEXTFIELD WRAPPER
            // You might need to target the actual textarea element inside this wrapper in tests
            // using .find('textarea')
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton size="small" onClick={handleSaveClick} color="success" aria-label={`Save ${label}`} disabled={isSaving} {...addTestId('save-button')}>
              <CheckIcon />
            </IconButton>
            <IconButton size="small" onClick={handleCancelClick} color="error" aria-label={`Cancel ${label} edit`} disabled={isSaving} {...addTestId('cancel-button')}>
              <CloseIcon />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditableTextArea;