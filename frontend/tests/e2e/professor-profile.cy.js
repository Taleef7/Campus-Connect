// frontend/tests/e2e/professor-profile.cy.js

describe('Professor Dashboard - Profile Tab', () => {
    beforeEach(() => {
      cy.login('professor');
      // Wait using the specific test ID for the name display element
      cy.get('[data-testid="prof-profile-name-display"]', { timeout: 15000 }).should('be.visible');
    });
  
    it('should display the professor\'s current profile information', () => {
       cy.fixture('users.json').then((users) => {
           cy.get('[data-testid="prof-profile-name-display"]').should('contain', users.professor.name);
           // Add checks for other fields using their '-display' test IDs
           // cy.get('[data-testid="prof-profile-department-display"]').should(...);
           // cy.get('[data-testid="prof-profile-headline-display"]').should(...);
       });
    });
  
    // --- IMPLEMENT THIS TEST ---
    it('should allow editing and saving the professor\'s name', () => {
      const newName = `Test Professor Edited ${Date.now()}`;
  
      // 1. Click Edit button for name
      cy.get('[data-testid="prof-profile-name-edit-button"]').should('be.visible').click();
  
      // 2. Find input wrapper, then input, clear, type
      cy.get('[data-testid="prof-profile-name-input-wrapper"]').should('be.visible')
        .find('input') // Find the actual <input> element
        .clear()
        .type(newName);
  
      // 3. Click Save button
      cy.get('[data-testid="prof-profile-name-save-button"]').should('be.visible').click();
  
      // 4. Assert new name is displayed
      cy.get('[data-testid="prof-profile-name-display"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', newName);
  
      // 5. Reload and verify persistence
      cy.reload();
      cy.get('[data-testid="prof-profile-name-display"]', { timeout: 10000 }) // Wait after reload
         .should('be.visible')
         .and('contain', newName);
  
      // --- Optional: Revert Name ---
      cy.fixture('users.json').then((users) => {
          cy.get('[data-testid="prof-profile-name-edit-button"]').should('be.visible').click();
          cy.get('[data-testid="prof-profile-name-input-wrapper"]').should('be.visible')
            .find('input')
            .clear()
            .type(users.professor.name); // Type original name back
          cy.get('[data-testid="prof-profile-name-save-button"]').should('be.visible').click();
          cy.get('[data-testid="prof-profile-name-display"]', { timeout: 10000 })
            .should('be.visible')
            .and('contain', users.professor.name); // Verify it's reverted
       });
      // --- End Revert ---
    });
    // --- END IMPLEMENTED TEST ---
  
    it('should allow editing and saving the professor\'s department', () => {
       // TODO: Use 'prof-profile-department' prefix and similar steps
     });
  
     it('should allow editing and saving the professor\'s headline', () => {
       // TODO: Use 'prof-profile-headline' prefix and similar steps
     });
  
     it('should allow editing and saving the professor\'s pronouns', () => {
       // TODO: Use 'prof-profile-pronouns' prefix and similar steps
     });
  
     it('should allow editing and saving the professor\'s about section', () => {
      // TODO: Use 'prof-profile-about' prefix. Remember to .find('textarea')
     });
  });