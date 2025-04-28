/* eslint-disable no-unused-vars */
// src/components/opportunities/OpportunityFeed.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert as MuiAlert, ToggleButtonGroup, ToggleButton, Snackbar, Stack } from '@mui/material';
// Import necessary Firestore functions and auth
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc, Timestamp, deleteDoc, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path if needed
import OpportunityListItem from './OpportunityListItem'; // Adjust path if needed
import ViewListIcon from '@mui/icons-material/ViewList'; // Icon for All
import StarIcon from '@mui/icons-material/Star'; // Icon for Interested

// --- Snackbar Alert ForwardRef ---
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
// --- End Snackbar Alert ---

const OpportunityFeed = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(null); // Renamed error state for clarity
  // State to track which opportunity's interest button is being processed
  const [processingInterestId, setProcessingInterestId] = useState(null);
  // --- New State: Store IDs of opportunities the student is interested in ---
  const [interestedOpportunityIds, setInterestedOpportunityIds] = useState(new Set());

  // --- State to manage the current view ('all' or 'interested') ---
  const [currentView, setCurrentView] = useState('all');

  // --- New state to track removal processing ---
  const [processingRemovalId, setProcessingRemovalId] = useState(null);

  // --- Add Snackbar State ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  // --- End Snackbar State ---


  // --- Modified useEffect to fetch both opportunities and interests ---
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const fetchInitialData = async () => {
      if (!isMounted) return; // Exit if unmounted

      setLoading(true);
      setFeedError(null);
      setInterestedOpportunityIds(new Set()); // Reset interests on fetch

      try {
        const currentUser = auth.currentUser;
        let interestsPromise = Promise.resolve([]); // Default to empty if not logged in

        // Prepare fetch for interests ONLY if user is logged in
        if (currentUser) {
          const interestsCollectionRef = collection(db, 'interests');
          // Query specifically for the current student's interests
          const interestsQuery = query(interestsCollectionRef, where('studentId', '==', currentUser.uid));
           // Rule check: This query has studentId as first filter, should be allowed by updated rule
          interestsPromise = getDocs(interestsQuery);
        }

        // Prepare fetch for all opportunities
        const opportunitiesCollectionRef = collection(db, 'opportunities');
        const opportunitiesQuery = query(opportunitiesCollectionRef, orderBy('createdAt', 'desc'));
        const opportunitiesPromise = getDocs(opportunitiesQuery);

        // Fetch both concurrently
        const [opportunitiesSnapshot, interestsSnapshot] = await Promise.all([
            opportunitiesPromise,
            interestsPromise
        ]);

        // Process opportunities if component is still mounted
        if (isMounted) {
            const fetchedOpportunities = opportunitiesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOpportunities(fetchedOpportunities);

            // Process interests if component is still mounted
            if (currentUser && interestsSnapshot) {
                 const fetchedInterestedIds = new Set(
                    interestsSnapshot.docs.map(doc => doc.data().opportunityId)
                 );
                 setInterestedOpportunityIds(fetchedInterestedIds);
            }
        }

      } catch (err) {
        console.error("Error fetching initial data:", err);
        if (isMounted) {
          setFeedError("Failed to load data. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Run only on mount


  // --- Add Snackbar Handlers ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') { return; }
    setSnackbarOpen(false);
};
const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
};
// --- End Snackbar Handlers ---


  // --- Modify handleMarkInterest ---
    // Now accepts the full opportunity object
    const handleMarkInterest = async (opportunity) => {
      // Destructure needed fields, including deadline
      const { id: opportunityId, professorId, deadline } = opportunity;

      // --- Deadline Check ---
      if (deadline && deadline.toDate) { // Check if deadline exists and is a Firestore Timestamp
          const deadlineDate = deadline.toDate();
          const today = new Date();
          // Consider deadline as end of day
          deadlineDate.setHours(23, 59, 59, 999);

          if (today > deadlineDate) {
              showSnackbar("The application deadline for this opportunity has passed.", "warning");
              return; // Stop execution
          }
      }
      // --- End Deadline Check ---

      // 1. Check if user is logged in
      if (!auth.currentUser) {
           showSnackbar("Please log in to mark your interest.", "error"); // Use Snackbar
          return;
      }
      if (processingInterestId) return; // Prevent multiple clicks

      const studentId = auth.currentUser.uid;
      setProcessingInterestId(opportunityId);
      setFeedError(null);

      try {
          // Fetch student profile data
          const studentDocRef = doc(db, 'users', studentId);
          const studentDocSnap = await getDoc(studentDocRef);
          if (!studentDocSnap.exists()) throw new Error("Could not find student profile.");
          const studentData = studentDocSnap.data();
          const studentName = studentData.name || 'Unknown Student';
          const studentEmail = auth.currentUser.email;
          const studentResumeLink = studentData.resumeLink || '';
          const studentPhotoLink = studentData.photoLink || '';

          // Prepare interest data
          const interestData = {
              opportunityId: opportunityId, studentId: studentId, professorId: professorId,
              studentName: studentName, studentEmail: studentEmail,
              studentResumeLink: studentResumeLink, studentPhotoLink: studentPhotoLink,
              timestamp: Timestamp.now()
          };

          // Add interest document
          const interestsCollectionRef = collection(db, 'interests');
          await addDoc(interestsCollectionRef, interestData);

          // Update Local State
          setInterestedOpportunityIds(prevSet => new Set(prevSet).add(opportunityId));
          console.log("Interest marked successfully for:", opportunityId);
          showSnackbar("Interest marked successfully!", "success"); // Use Snackbar

      } catch (err) {
           console.error("Error marking interest:", err);
           // Check for permission denied specifically if needed
          // if (err.code === 'permission-denied') { ... } else { ... }
           showSnackbar(`Failed to mark interest: ${err.message}`, 'error'); // Use Snackbar
      } finally {
          setProcessingInterestId(null);
      }
  };
  // --- End handleMarkInterest modification ---


  // --- Modify handleRemoveInterest for Snackbar ---
  const handleRemoveInterest = async (opportunityId) => {
    if (!auth.currentUser) {
        showSnackbar("Please log in.", "error"); // Use Snackbar
        return;
    }
    if (processingInterestId || processingRemovalId) return;

    const studentId = auth.currentUser.uid;
    setProcessingRemovalId(opportunityId);
    setFeedError(null);

    try {
        // Find the interest document ID
        const interestsCollectionRef = collection(db, 'interests');
        const interestQuery = query( interestsCollectionRef, where('opportunityId', '==', opportunityId), where('studentId', '==', studentId), limit(1) );
        const interestSnap = await getDocs(interestQuery);

        if (interestSnap.empty) {
            throw new Error("Could not find the interest record to remove.");
        }
        // Delete the document
        const interestDocId = interestSnap.docs[0].id;
        const interestDocRef = doc(db, 'interests', interestDocId);
        await deleteDoc(interestDocRef);

        // Update local state
        setInterestedOpportunityIds(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(opportunityId);
            return newSet;
        });
        console.log("Interest removed successfully for:", opportunityId);
         showSnackbar("Interest removed successfully!", "success"); // Use Snackbar

    } catch (err) {
        console.error("Error removing interest:", err);
        showSnackbar(`Failed to remove interest: ${err.message}`, 'error'); // Use Snackbar
    } finally {
        setProcessingRemovalId(null);
    }
  };
  // --- End handleRemoveInterest modification ---


  // --- Handler for changing the view ---
  const handleViewChange = (event, newView) => {
    // Ensure a view is always selected
    if (newView !== null) {
      setCurrentView(newView);
    }
  };

  // --- Filter opportunities based on the current view ---
  const opportunitiesToDisplay = currentView === 'all'
    ? opportunities // Show all if 'all' view is selected
    : opportunities.filter(opp => interestedOpportunityIds.has(opp.id)); // Show only interested ones otherwise

    return (
        <Box sx={{ p: 2}}>
          {/* View Toggle Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ToggleButtonGroup
              value={currentView}
              exclusive // Ensures only one button can be active
              onChange={handleViewChange}
              aria-label="Opportunity view selection"
            >
              <ToggleButton value="all" aria-label="all opportunities">
                 <ViewListIcon sx={{ mr: 1 }} /> All Opportunities
              </ToggleButton>
              <ToggleButton value="interested" aria-label="interested opportunities">
                 <StarIcon sx={{ mr: 1 }} /> My Interests
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Conditional Title based on view */}
          <Typography variant="h6" gutterBottom>
            {currentView === 'all' ? 'Available Opportunities' : 'Your Opportunities'}
          </Typography>

          {/* Loading Indicator */}
          {loading && ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}> <CircularProgress /> </Box> )}

          {/* Error Message */}
          {feedError && ( <Alert severity="error" sx={{ mt: 2 }}>{feedError}</Alert> )}

          {/* No Opportunities Message (Context-aware) */}
          {!loading && !feedError && opportunitiesToDisplay.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
              {currentView === 'all'
                 ? "No opportunities have been posted yet. Check back later!"
                 : "You haven't marked interest in any opportunities yet."
              }
            </Typography>
          )}

          {/* Display Filtered Opportunities List */}
          {!loading && !feedError && opportunitiesToDisplay.length > 0 && (
                 // Use Stack for consistent spacing between items
                 <Stack spacing={2} sx={{ mt: 2 }}>
                    {opportunitiesToDisplay.map((opp) => {
                        const isAlreadyInterested = interestedOpportunityIds.has(opp.id);
                        // --- Calculate deadlinePassed here ---
                        let deadlinePassed = false;
                        if (opp.deadline?.toDate) {
                            const deadlineDate = opp.deadline.toDate();
                            const today = new Date();
                            deadlineDate.setHours(23, 59, 59, 999); // End of deadline day
                            deadlinePassed = today > deadlineDate;
                        }
                        // --- End deadline check ---

                        return (
                            <OpportunityListItem
                                key={opp.id}
                                opportunity={opp}
                                viewMode="student"
                                // Pass the handler wrapped to include the opp object implicitly
                                onMarkInterest={() => handleMarkInterest(opp)}
                                isProcessingInterest={processingInterestId === opp.id}
                                isAlreadyInterested={isAlreadyInterested}
                                onRemoveInterest={handleRemoveInterest} // Pass opportunityId directly? Or modify handler
                                isProcessingRemoval={processingRemovalId === opp.id}
                                // --- Pass deadlinePassed prop ---
                                deadlinePassed={deadlinePassed}
                                // --- End pass prop ---
                            />
                        );
                    })}
                 </Stack>
            )}

             {/* --- Add Snackbar Component --- */}
             <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                 <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                     {snackbarMessage}
                 </Alert>
             </Snackbar>
             {/* --- End Snackbar --- */}
        </Box>
      );
};

export default OpportunityFeed;