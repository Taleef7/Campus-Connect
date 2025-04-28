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
        const newDepartment = `Test Dept ${Date.now()}`;
        const testIdPrefix = 'prof-profile-department';
   
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear().type(newDepartment);
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newDepartment);
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newDepartment);
   
        // Revert
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear(); // Revert to empty
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        // Check for the specific empty text used in ProfileInfoSection
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', '(Not set)');
     });
   
      it('should allow editing and saving the professor\'s headline', () => {
        const newHeadline = `Test Headline ${Date.now()}`;
        const testIdPrefix = 'prof-profile-headline';
   
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear().type(newHeadline);
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newHeadline);
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newHeadline);
   
        // Revert
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear();
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', '(No headline)');
      });
   
      it('should allow editing and saving the professor\'s pronouns', () => {
        const newPronouns = `they/them/${Date.now()}`; // Add timestamp for uniqueness
        const testIdPrefix = 'prof-profile-pronouns';
   
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear().type(newPronouns);
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newPronouns);
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', newPronouns);
   
         // Revert
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
          .find('input').clear();
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('contain', '(Not set)');
      });
   
      it('should allow editing and saving the professor\'s about section', () => {
        const newAbout = `New professor about section added by Cypress at ${new Date().toISOString()}`;
        const testIdPrefix = 'prof-profile-about';
    
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
    
        // Get the wrapper, find textareas within it, filter for the visible one, then clear/type
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`)
          .should('be.visible')
          .find('textarea') // Find potentially multiple textareas
          .filter(':visible') // Filter down to only the visible one(s)
          .first() // Explicitly take the first one if multiple are somehow visible
          .clear({ force: true }) // Now clear should work
          .type(newAbout, { force: true });
    
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
           // Using 'include.text' might be better for multi-line content than 'contain'
          .should('be.visible').and('include.text', newAbout.substring(0, 50)); // Check start of text
    
        cy.reload();
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
          .should('be.visible').and('include.text', newAbout.substring(0, 50));
    
        // Revert
        cy.get(`[data-testid="${testIdPrefix}-edit-button"]`).should('be.visible').click();
        cy.get(`[data-testid="${testIdPrefix}-input-wrapper"]`).should('be.visible')
        .find('textarea')
        .filter(':visible')
        .first()
        .clear({ force: true });
        cy.get(`[data-testid="${testIdPrefix}-save-button"]`).should('be.visible').click();

        // --- CHANGE THIS ASSERTION ---
        cy.get(`[data-testid="${testIdPrefix}-display"]`, { timeout: 10000 })
        .should('be.visible')
        // Assert it contains the PLACEHOLDER text now, not the emptyText
        .and('contain', '(Provide a brief description about yourself)');
        // --- END CHANGE ---
      });
  });