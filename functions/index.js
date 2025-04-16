// functions/index.js

// Import v1 explicitly
const functions = require("firebase-functions/v1"); // Use v1 namespace
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

/**
 * Triggered when a user account is deleted from Firebase Authentication.
 * Deletes the corresponding user document in Firestore and their files in Storage.
 */
// Use the v1 syntax which is generally stable
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
    const userId = user.uid;
    console.log(`Attempting to clean up data for deleted user: ${userId}`);

    // 1. Delete Firestore Document
    const userDocRef = db.collection("users").doc(userId);
    try {
        await userDocRef.delete();
        console.log(`Successfully deleted Firestore document for user: ${userId}`);
    } catch (error) {
        console.error(`Error deleting Firestore document for user ${userId}:`, error);
    }

    // 2. Delete Storage Files (Photos, Resumes, Covers)
    const photoPrefix = `photos/${userId}/`;
    const resumePrefix = `resumes/${userId}/`;
    const coverPrefix = `covers/${userId}/`; // Make sure this path matches your code
    const deletePromises = [];

  // Delete photos folder
  deletePromises.push(
    storage.deleteFiles({ prefix: photoPrefix }).catch((error) => {
      // Log error but don't necessarily fail the whole function if one path fails
      // (e.g., if user never uploaded a photo, the folder might not exist)
      if (error.code !== 404) { // Ignore "Not Found" errors
         console.error(`Error deleting files in ${photoPrefix} for user ${userId}:`, error);
      } else {
          console.log(`Storage path ${photoPrefix} not found for user ${userId}, skipping delete.`);
      }
    })
  );

  // Delete resumes folder
  deletePromises.push(
    storage.deleteFiles({ prefix: resumePrefix }).catch((error) => {
      if (error.code !== 404) {
         console.error(`Error deleting files in ${resumePrefix} for user ${userId}:`, error);
      } else {
          console.log(`Storage path ${resumePrefix} not found for user ${userId}, skipping delete.`);
      }
    })
  );

  // Delete covers folder
  deletePromises.push(
    storage.deleteFiles({ prefix: coverPrefix }).catch((error) => {
      if (error.code !== 404) {
        console.error(`Error deleting files in ${coverPrefix} for user ${userId}:`, error);
      } else {
          console.log(`Storage path ${coverPrefix} not found for user ${userId}, skipping delete.`);
      }
    })
  );

  try {
      await Promise.all(deletePromises);
      console.log(`Successfully triggered storage cleanup attempts for user: ${userId}`);
  } catch(error) {
      // This catch might not be reached if individual promises catch errors,
      // but good practice to have.
      console.error(`Error during Promise.all for storage deletion for user ${userId}:`, error);
  }

  return null; // Indicate function completion
});