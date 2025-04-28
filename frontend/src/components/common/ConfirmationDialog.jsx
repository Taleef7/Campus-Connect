/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/common/ConfirmationDialog.jsx
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';

const ConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title = "Confirm Action", // Default title
    message = "Are you sure you want to proceed? This action cannot be undone.", // Default message
    confirmText = "Confirm", // Default confirm button text
    cancelText = "Cancel", // Default cancel button text
    isProcessing = false, // Optional: disable buttons while processing confirm action
    dialogTestId = "confirmation-dialog",
    confirmButtonTestId = "confirmation-dialog-confirm-button",
    cancelButtonTestId = "confirmation-dialog-cancel-button"
}) => {

    return (
        <Dialog
            open={open}
            onClose={() => !isProcessing && onClose()} // Prevent closing while processing
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
            data-testid={dialogTestId} // <<< ADDED TEST ID
        >
            <DialogTitle id="confirmation-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isProcessing} data-testid={cancelButtonTestId}>
                    {cancelText}
                </Button>
                 {/* Make confirm button stand out, often uses primary or error color */}
                <Button
                    onClick={onConfirm}
                    color="primary" // Or maybe "error" for delete actions
                    variant="contained" // Make it more prominent
                    autoFocus // Focus on confirm by default
                    disabled={isProcessing}
                    data-testid={confirmButtonTestId}
                >
                    {isProcessing ? "Processing..." : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isProcessing: PropTypes.bool
};


export default ConfirmationDialog;