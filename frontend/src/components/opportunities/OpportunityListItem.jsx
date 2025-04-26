/* eslint-disable react/prop-types */
// frontend/src/components/opportunities/OpportunityListItem.jsx
import { Paper, Box, Typography, Chip, IconButton, Button, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import an icon for the student button
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Import an icon for remove interest
import { Timestamp } from 'firebase/firestore';

// Helper function to format Firestore Timestamps
const formatDate = (timestamp) => {
  if (!timestamp || !(timestamp instanceof Timestamp)) {
    return 'N/A';
  }
  return timestamp.toDate().toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

// Add onMarkInterest prop to the component signature
const OpportunityListItem = ({
    opportunity,
    onEdit,
    onDelete,
    onViewInterested,
    viewMode,
    onMarkInterest,
    isProcessingInterest, // <-- Accept the new prop // <-- Handler function for student marking interest
    isAlreadyInterested, // <-- New prop
    onRemoveInterest, // <-- New handler prop
    isProcessingRemoval // <-- New prop to disable remove button during processing
}) => {

    const isProfessorView = viewMode === 'professor';
    const isStudentView = viewMode === 'student';

    // Placeholder handler - the real logic will be in the parent component (OpportunityFeed)
    const handleInterestClick = () => {
        console.log(`Student interested in opportunity: ${opportunity.id}, professor: ${opportunity.professorId}`);
        if (onMarkInterest) {
            // Pass the necessary IDs up to the parent component's handler
            onMarkInterest(opportunity.id, opportunity.professorId);
        }
    };

    // --- Handler for removing interest ---
    const handleRemoveInterestClick = () => {
        console.log(`Student removing interest from opportunity: ${opportunity.id}`);
        if (onRemoveInterest) {
            // Pass only the opportunityId up, as studentId is known in parent
            onRemoveInterest(opportunity.id);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Left side: Title, Type, Interest Chip */}
                <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" gutterBottom>{opportunity.title}</Typography>
                    <Chip label={opportunity.type || 'General'} size="small" sx={{ mr: 1, mb: 1 }} />
                    {opportunity.allowInterest && <Chip label="Interest Enabled" size="small" color="success" variant="outlined" sx={{ mb: 1 }} />}
                </Box>

                {/* Right side: Controls Container */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                    {/* Render Professor Controls ONLY if isProfessorView */}
                    {isProfessorView && (
                        <>
                            {opportunity.allowInterest && onViewInterested && (
                                <Button size="small" startIcon={<GroupIcon />} onClick={() => onViewInterested(opportunity.id)} variant="outlined" sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}> View Interested </Button>
                            )}
                            {onEdit && (
                                <IconButton size="small" onClick={() => onEdit(opportunity)} aria-label="edit"> <EditIcon fontSize="inherit" /> </IconButton>
                            )}
                            {onDelete && (
                                <IconButton size="small" onClick={() => onDelete(opportunity.id)} aria-label="delete"> <DeleteIcon fontSize="inherit" color="error"/> </IconButton>
                            )}
                        </>
                    )}

                    {/* Student Buttons: Render based on interest status */}
                    {isStudentView && opportunity.allowInterest && (
                        <> {/* Use Fragment to group student buttons */}
                            {!isAlreadyInterested && onMarkInterest && ( // Show "I'm Interested" only if NOT already interested
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CheckCircleOutlineIcon />}
                                    onClick={handleInterestClick}
                                    disabled={isProcessingInterest}
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {isProcessingInterest ? 'Processing...' : "I'm Interested"}
                                </Button>
                            )}
                            {isAlreadyInterested && onRemoveInterest && ( // Show "Remove Interest" only IF already interested
                                <Button
                                    variant="outlined" // Different style for remove
                                    size="small"
                                    color="error" // Use error color
                                    startIcon={<HighlightOffIcon />}
                                    onClick={handleRemoveInterestClick}
                                    disabled={isProcessingRemoval} // Use separate processing state
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {isProcessingRemoval ? 'Removing...' : "Remove Interest"}
                                </Button>
                            )}
                         </>
                    )}
                </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            {/* Description and Dates */}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                {opportunity.description}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Posted: {formatDate(opportunity.createdAt)} by {opportunity.professorName || 'Professor'}
                </Typography>
                {opportunity.deadline && (
                    <Typography variant="caption" color="error">
                        Deadline: {formatDate(opportunity.deadline)}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default OpportunityListItem;