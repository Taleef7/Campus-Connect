/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/opportunities/OpportunityListItem.jsx

import { Paper, Box, Typography, Chip, IconButton, Button, Divider, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { Timestamp } from 'firebase/firestore';
import { useTheme, useMediaQuery } from '@mui/material';

const formatDate = (timestamp) => {
  if (!timestamp || !(timestamp instanceof Timestamp)) {
    return 'N/A';
  }
  return timestamp.toDate().toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const OpportunityListItem = ({
  opportunity,
  onEdit,
  onDelete,
  onViewInterested,
  viewMode,
  onMarkInterest,
  isProcessingInterest,
  isAlreadyInterested,
  onRemoveInterest,
  isProcessingRemoval,
  deadlinePassed
}) => {
  const isProfessorView = viewMode === 'professor';
  const isStudentView = viewMode === 'student';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInterestClick = () => {
    if (onMarkInterest) {
      onMarkInterest(opportunity);
    }
  };

  const handleRemoveInterestClick = () => {
    if (onRemoveInterest) {
      onRemoveInterest(opportunity.id);
    }
  };

  const deadlineString = formatDate(opportunity.deadline);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }} data-testid={`opportunity-list-item-${opportunity.id}`}>
      {/* --- Top Section: Title + Edit/Delete --- */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} data-testid={`opportunity-item-title-${opportunity.id}`}>
          {opportunity.title}
        </Typography>
        {/* Edit and Delete Icons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isProfessorView && onEdit && (
            <IconButton size="small" onClick={() => onEdit(opportunity)} data-testid={`opportunity-item-edit-button-${opportunity.id}`}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          )}
          {isProfessorView && onDelete && (
            <IconButton size="small" onClick={() => onDelete(opportunity.id)} data-testid={`opportunity-item-delete-button-${opportunity.id}`}>
              <DeleteIcon fontSize="inherit" color="error" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* --- Second Row: Opportunity Type + View Interested --- */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        mb: 1,
        gap: 1
      }}>
        <Chip
          label={opportunity.type || 'General'}
          size="small"
          color="default"
          data-testid={`opportunity-item-type-${opportunity.id}`} // <<< ADDED
        />

        {/* View Interested / Mark Interest Buttons */}
        {isProfessorView && opportunity.allowInterest && onViewInterested && (
          <Button
            data-testid={`opportunity-item-view-interested-button-${opportunity.id}`}
            size="small"
            startIcon={<GroupIcon />}
            onClick={() => onViewInterested(opportunity.id)}
            variant="outlined"
            sx={{ textTransform: 'none', minWidth: '120px' }}
          >
            View Interested
          </Button>
        )}

        {isStudentView && opportunity.allowInterest && !isAlreadyInterested && (
          <Button
            data-testid={`opportunity-item-mark-interest-button-${opportunity.id}`}
            variant="contained"
            size="small"
            startIcon={isProcessingInterest ? <CircularProgress size={16} color="inherit" /> : <FavoriteBorderIcon fontSize="small" />}
            onClick={handleInterestClick}
            disabled={isProcessingInterest || deadlinePassed}
            sx={{ textTransform: 'none', minWidth: '120px' }}
          >
            {isProcessingInterest ? 'Processing...' : 'Mark Interest'}
          </Button>
        )}

        {isStudentView && opportunity.allowInterest && isAlreadyInterested && (
          <Button
            data-testid={`opportunity-item-remove-interest-button-${opportunity.id}`}
            variant="outlined"
            size="small"
            color="error"
            startIcon={<HighlightOffIcon />}
            onClick={handleRemoveInterestClick}
            disabled={isProcessingRemoval}
            sx={{ textTransform: 'none', minWidth: '120px' }}
          >
            {isProcessingRemoval ? 'Removing...' : 'Remove Interest'}
          </Button>
        )}

        {isStudentView && !opportunity.allowInterest && (
          <Chip label="Interest not enabled" size="small" disabled />
        )}
      </Box>

      {/* --- Third Row: Interest Enabled Chip (only) --- */}
      {opportunity.allowInterest && !isStudentView && (
        <Box sx={{ mb: 2 }}>
          <Chip label="Interest Enabled" size="small" color="success" variant="outlined" />
        </Box>
      )}
      {isStudentView && opportunity.allowInterest && deadlinePassed && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<AccessTimeFilledIcon fontSize="small" />}
            label="Deadline Passed"
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>
      )}

      {/* --- Divider --- */}
      <Divider sx={{ my: 1.5 }} />

      {/* --- Description Section --- */}
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', mb: 1 }} data-testid={`opportunity-item-desc-${opportunity.id}`}>
        {opportunity.description}
      </Typography>

      {/* --- Footer Info: Posted and Deadline --- */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 1.5,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="caption" color="text.secondary">
          Posted: {formatDate(opportunity.createdAt)} {opportunity.professorName ? `by ${opportunity.professorName}` : ''}
        </Typography>
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
