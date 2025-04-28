// frontend/tests/e2e/student-profile.cy.js
/// <reference types="cypress" />
// This test suite is for the student dashboard profile tab functionality.

describe('Student Dashboard - Profile Tab', () => {
    beforeEach(() => {
      cy.login('student'); // Use our custom login command
      // Wait for profile tab & name display to ensure page is ready
      cy.get('[data-testid="tab-profile"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-testid="profile-name-display"]', { timeout: 10000 }).should('be.visible');
    });
  
    it('should display the student\'s current profile information', () => {
       cy.fixture('users.json').then((users) => {
           // Use the test ID for the display element
           cy.get('[data-testid="profile-name-display"]').should('contain', users.student.name);
           // cy.get('[data-testid="profile-major-display"]').should(...); // Add checks for other fields
       });
    });
  
    it('should allow editing and saving the student\'s name', () => {
      const newName = `Test Student Edited ${Date.now()}`; // Unique name
  
      // 1. Click the Edit button associated with the name
      cy.get('[data-testid="profile-name-edit-button"]').should('be.visible').click();
  
      // 2. Find the TextField wrapper, then the input inside, clear, and type
      cy.get('[data-testid="profile-name-input-wrapper"]').should('be.visible')
        .find('input') // Find the actual <input> element
        .clear()
        .type(newName);
  
      // 3. Click the Save button associated with the name
      cy.get('[data-testid="profile-name-save-button"]').should('be.visible').click();
  
      // 4. Assert the new name is displayed (wait for display element to reappear)
      cy.get('[data-testid="profile-name-display"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', newName);
  
      // 5. Reload and verify persistence
      cy.reload();
      cy.get('[data-testid="profile-name-display"]', { timeout: 10000 })
         .should('be.visible')
         .and('contain', newName);
  
      // --- Optional: Revert the name back for subsequent tests ---
      // (Good practice if tests depend on the original name)
      cy.fixture('users.json').then((users) => {
          cy.get('[data-testid="profile-name-edit-button"]').should('be.visible').click();
          cy.get('[data-testid="profile-name-input-wrapper"]').should('be.visible')
            .find('input')
            .clear()
            .type(users.student.name); // Type original name back
          cy.get('[data-testid="profile-name-save-button"]').should('be.visible').click();
          cy.get('[data-testid="profile-name-display"]', { timeout: 10000 })
            .should('be.visible')
            .and('contain', users.student.name); // Verify it's reverted
       });
      // --- End Revert ---
    });
  
     it('should allow editing and saving the student\'s major', () => {
       // TODO: Use 'profile-major' prefix and similar steps
     });
  
     it('should allow editing and saving the student\'s year', () => {
       // TODO: Use 'profile-year' prefix and similar steps
     });
  
     it('should allow editing and saving the student\'s description', () => {
       // TODO: Use 'profile-description' prefix. Remember to .find('textarea') for input.
     });
  
  });