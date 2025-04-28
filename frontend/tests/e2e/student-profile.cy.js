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
        const newMajor = `Test Major ${Date.now()}`;
        const testIdPrefix = 'profile-major';
   
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear().type(newMajor);
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newMajor);
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newMajor);
   
        // Revert (Optional - revert to empty or original value if needed)
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear(); // Clear it back to empty
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', '(Not set)'); // Check for empty text
     });
   
     it('should allow editing and saving the student\'s year', () => {
        const newYear = `Test Year ${Date.now()}`;
        const testIdPrefix = 'profile-year';
   
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear().type(newYear);
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newYear);
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newYear);
   
        // Revert
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear();
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', '(Not set)');
     });
   
     it('should allow editing and saving the student\'s description', () => {
        const newDescription = `Test student description added by Cypress at ${new Date().toLocaleTimeString()}`;
        const testIdPrefix = 'profile-description';
    
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
    
        // *** APPLY THE FIX HERE ***
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`)
          .should('be.visible')
          .find('textarea')      // Find textareas
          .filter(':visible')    // Filter for the visible one
          .first()               // Select the first visible one
          .clear({ force: true })  // Force clear
          .type(newDescription, { force: true }); // Force type
        // *** END FIX ***
    
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('include.text', newDescription.substring(0, 50)); // Check partial text
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('include.text', newDescription.substring(0, 50));
    
        // Revert
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
        .find('textarea')
        .filter(':visible')
        .first()
        .clear({ force: true }); // Force clear
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();

        // --- CHANGE THIS ASSERTION ---
        // Check for the actual PLACEHOLDER text displayed when the value is empty
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
        .should('be.visible')
        .and('contain', '(Tell professors a bit about yourself)'); // <<< Use the placeholder text
        // --- END CHANGE ---
      });
  });