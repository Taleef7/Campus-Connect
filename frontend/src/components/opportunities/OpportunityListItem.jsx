/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/opportunities/OpportunityListItem.jsx
import { Paper, Box, Typography, Chip, IconButton, Button, Divider, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import an icon for the student button
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Import an icon for remove interest
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Icon for Mark Interest
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'; // Icon for deadline passed
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
    isProcessingRemoval, // <-- New prop to disable remove button during processing
    deadlinePassed // <<< --- Accept the new prop ---
}) => {

    const isProfessorView = viewMode === 'professor';
    const isStudentView = viewMode === 'student';

    // Modify handler to pass the full opportunity object
    const handleInterestClick = () => {
        console.log(`Student interested in opportunity: ${opportunity.id}`);
        if (onMarkInterest) {
            // Pass the entire opportunity object up, as the handler now expects it
            onMarkInterest(opportunity); // <<< --- MODIFIED ---
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

    const deadlineString = formatDate(opportunity.deadline);

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Left side: Title, Type, Interest Chip */}
                <Box sx={{ mb: 1, mr: 2 }}> {/* Add margin-right */}
                    <Typography variant="h6" gutterBottom>{opportunity.title}</Typography>
                    <Chip label={opportunity.type || 'General'} size="small" sx={{ mr: 1, mb: 1 }} />
                    {/* Indicate if interest is enabled */}
                    {opportunity.allowInterest && !isStudentView && <Chip label="Interest Enabled" size="small" color="success" variant="outlined" sx={{ mb: 1 }} />}
                     {/* Indicate if deadline passed (only for students when interest allowed) */}
                     {isStudentView && opportunity.allowInterest && deadlinePassed && (
                        <Chip
                            icon={<AccessTimeFilledIcon fontSize='small'/>}
                            label="Deadline Passed"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ mb: 1 }}
                         />
                     )}
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

                    {/* Student Buttons */}
                    {isStudentView && opportunity.allowInterest && (
                        <>
                             {/* Show "I'm Interested" only if NOT already interested */}
                            {!isAlreadyInterested && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="primary" // Use theme primary
                                    startIcon={isProcessingInterest ? <CircularProgress size={16} color="inherit"/> : <FavoriteBorderIcon fontSize='small'/>}
                                    onClick={handleInterestClick}
                                     // --- Disable button if processing OR deadline passed ---
                                    disabled={isProcessingInterest || deadlinePassed}
                                     // --- End disable change ---
                                    sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
                                >
                                    {isProcessingInterest ? 'Processing...' : "Mark Interest"}
                                </Button>
                             )}
                             {/* Show "Remove Interest" only IF already interested */}
                            {isAlreadyInterested && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    startIcon={<HighlightOffIcon />}
                                    onClick={handleRemoveInterestClick}
                                    disabled={isProcessingRemoval}
                                    sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
                                >
                                    {isProcessingRemoval ? 'Removing...' : "Remove Interest"}
                                </Button>
                             )}
                        </>
                     )}
                     {/* Show message if interest not allowed */}
                      {isStudentView && !opportunity.allowInterest && (
                            <Chip label="Interest not enabled" size="small" disabled />
                      )}
                </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} /> {/* Increase divider margin */}
            {/* Description */}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1, overflowWrap: 'break-word' }}> {/* Added overflowWrap */}
                {opportunity.description}
            </Typography>
            {/* Footer Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 1 }}> {/* Increase top margin */}
                 <Typography variant="caption" color="text.secondary">
                     Posted: {formatDate(opportunity.createdAt)} {opportunity.professorName ? `by ${opportunity.professorName}` : ''}
                 </Typography>
                  {/* Display Deadline - don't make it error color here, rely on chip above */}
                  {deadlineString && (
                      <Typography variant="caption" color="text.secondary">
                          Deadline: {deadlineString}
                      </Typography>
                  )}
            </Box>
        </Paper>
    );
};

export default OpportunityListItem;