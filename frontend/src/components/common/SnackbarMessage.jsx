/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

const SnackbarMessage = ({ open, message, severity, onClose, duration = 4000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <MuiAlert
        onClose={onClose}
        severity={severity || 'info'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default SnackbarMessage;