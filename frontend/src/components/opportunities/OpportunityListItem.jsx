import React from 'react';
import {
  Paper, Box, Typography, Chip, IconButton, Button, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import FavoriteIcon from '@mui/icons-material/Favorite'; // New Icon
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // New Icon

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
  isProcessingRemoval
}) => {
  const isProfessorView = viewMode === 'professor';
  const isStudentView = viewMode === 'student';

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6">{opportunity.title}</Typography>
          <Chip label={opportunity.type || 'General'} size="small" sx={{ mr: 1, mb: 1 }} />
          {opportunity.allowInterest && (
            <Chip label="Interest Enabled" size="small" color="success" variant="outlined" sx={{ mb: 1 }} />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {/* Professor Side Buttons */}
          {isProfessorView && (
            <>
              {opportunity.allowInterest && onViewInterested && (
                <Button
                  size="small"
                  startIcon={<GroupIcon />}
                  onClick={() => onViewInterested(opportunity.id)}
                  variant="outlined"
                >
                  View Interested
                </Button>
              )}
              {onEdit && (
                <IconButton size="small" onClick={() => onEdit(opportunity)} aria-label="edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" onClick={() => onDelete(opportunity.id)} aria-label="delete">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          )}

          {/* Student Side Button */}
          {isStudentView && opportunity.allowInterest && (
            <>
              {!isAlreadyInterested ? (
                <Button
                  size="small"
                  startIcon={<FavoriteBorderIcon />}
                  onClick={() => onMarkInterest(opportunity.id, opportunity.professorId)}
                  disabled={isProcessingInterest}
                  variant="outlined"
                >
                  {isProcessingInterest ? "Processing..." : "Mark Interested"}
                </Button>
              ) : (
                <Button
                  size="small"
                  startIcon={<FavoriteIcon />}
                  onClick={() => onRemoveInterest(opportunity.id)}
                  disabled={isProcessingRemoval}
                  color="error"
                  variant="outlined"
                >
                  {isProcessingRemoval ? "Removing..." : "Remove Interest"}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
        {opportunity.description}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Posted on: {formatDate(opportunity.createdAt)}
      </Typography>
    </Paper>
  );
};

export default OpportunityListItem;
