/* eslint-disable no-unused-vars */
// src/components/opportunities/OpportunityFeed.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
// Import necessary Firestore functions and auth
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc, Timestamp, deleteDoc, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path if needed
import OpportunityListItem from './OpportunityListItem'; // Adjust path if needed
import ViewListIcon from '@mui/icons-material/ViewList'; // Icon for All
import StarIcon from '@mui/icons-material/Star'; // Icon for Interested

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


  // --- Handler Function for Marking Interest ---
  const handleMarkInterest = async (opportunityId, professorId) => {
    // 1. Check if user is logged in
    if (!auth.currentUser) {
      alert("Please log in to mark your interest."); // Or use a more sophisticated notification
      return;
    }
    // Prevent multiple simultaneous requests for different items
    if (processingInterestId) return;

    const studentId = auth.currentUser.uid;
    setProcessingInterestId(opportunityId); // Set loading state for this specific item
    setFeedError(null); // Clear previous errors specific to the feed loading

    try {
      // 1. Fetch student profile data (name, resume link, AND photo link)
      const studentDocRef = doc(db, 'users', studentId);
      const studentDocSnap = await getDoc(studentDocRef);
      if (!studentDocSnap.exists()) {
        throw new Error("Could not find your student profile data.");
      }
      const studentData = studentDocSnap.data();
      const studentName = studentData.name || 'Unknown Student';
      const studentEmail = auth.currentUser.email;
      const studentResumeLink = studentData.resumeLink || '';
      // --- Get the photo link ---
      const studentPhotoLink = studentData.photoLink || ''; // Get photoLink, default to empty string

      // 2. Prepare interest data (including photo link)
      const interestData = {
        opportunityId: opportunityId,
        studentId: studentId,
        professorId: professorId,
        studentName: studentName,
        studentEmail: studentEmail,
        studentResumeLink: studentResumeLink,
        studentPhotoLink: studentPhotoLink, // <-- Add photo link here
        timestamp: Timestamp.now()
      };

      // 3. Add the interest document
      const interestsCollectionRef = collection(db, 'interests');
      await addDoc(interestsCollectionRef, interestData);

      // 4. Update Local State Immediately
      setInterestedOpportunityIds(prevSet => new Set(prevSet).add(opportunityId));

      console.log("Interest marked successfully for:", opportunityId);
      alert("Interest marked successfully!");

    } catch (err) {
        // Check if the error is specifically permission denied on CREATE
        if (err.code === 'permission-denied') {
             alert("Permission denied. Ensure you are logged in as a student.");
        } else {
             alert(`Failed to mark interest: ${err.message}`);
        }
        console.error("Error marking interest:", err);
        alert(`Failed to mark interest: ${err.message}`)
    } finally {
      // Reset the loading state for this item regardless of success/failure
      setProcessingInterestId(null);
    }
  };
  // --- End Handler ---


  // --- Handler Function for Removing Interest ---
  const handleRemoveInterest = async (opportunityId) => {
    if (!auth.currentUser) {
      alert("Please log in.");
      return;
    }
    // Prevent clicking if another add/remove is processing
    if (processingInterestId || processingRemovalId) return;

    const studentId = auth.currentUser.uid;
    setProcessingRemovalId(opportunityId); // Set processing state for removal
    setFeedError(null);

    try {
      // 1. Find the specific interest document ID to delete
      const interestsCollectionRef = collection(db, 'interests');
      const interestQuery = query(
        interestsCollectionRef,
        where('opportunityId', '==', opportunityId),
        where('studentId', '==', studentId),
        limit(1) // We only expect one match
      );
      const interestSnap = await getDocs(interestQuery);

      if (interestSnap.empty) {
        // If the button was shown, the record should exist, but handle defensively
        console.warn("Tried to remove interest, but couldn't find the record for opportunity:", opportunityId);
        throw new Error("Could not find the interest record to remove.");
      }

      // 2. Get the document ID and delete the document
      const interestDocId = interestSnap.docs[0].id;
      const interestDocRef = doc(db, 'interests', interestDocId);
      // Security Rule Check: The existing 'delete' rule for interests should allow this
      await deleteDoc(interestDocRef);

      // 3. Update local state immediately to reflect removal
      setInterestedOpportunityIds(prevSet => {
        const newSet = new Set(prevSet);
        newSet.delete(opportunityId); // Remove the ID from the local set
        return newSet;
      });

      console.log("Interest removed successfully for:", opportunityId);
      alert("Interest removed successfully!");

    } catch (err) {
      console.error("Error removing interest:", err);
      alert(`Failed to remove interest: ${err.message}`);
    } finally {
      setProcessingRemovalId(null); // Reset processing state for removal
    }
  };
  // --- End Handler ---


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
        <Box>
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
            {currentView === 'all' ? 'Available Opportunities' : 'Opportunities You\'re Interested In'}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {/* Map over the FILTERED array */}
              {opportunitiesToDisplay.map((opp) => {
                const isAlreadyInterested = interestedOpportunityIds.has(opp.id);
                return (
                  <OpportunityListItem
                    key={opp.id}
                    opportunity={opp}
                    viewMode="student"
                    onMarkInterest={handleMarkInterest}
                    isProcessingInterest={processingInterestId === opp.id}
                    isAlreadyInterested={isAlreadyInterested}
                    // We will add onRemoveInterest next
                    // --- Pass down the new handler and state ---
                    onRemoveInterest={handleRemoveInterest}
                    isProcessingRemoval={processingRemovalId === opp.id}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      );
};

export default OpportunityFeed;