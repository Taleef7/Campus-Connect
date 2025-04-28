// frontend/tests/e2e/opportunities.cy.js

describe('Professor Dashboard - Opportunity Management', () => {
    beforeEach(() => {
      cy.login('professor');
      cy.get('[data-testid="prof-tab-opportunities"]', { timeout: 15000 })
        .should('be.visible')
        .click();
      cy.get('[data-testid="post-opportunity-button"]', { timeout: 10000 }).should('be.visible');
    });
  
    it('should allow posting a new opportunity', () => {
        const oppTitle = `Test Opportunity ${Date.now()}`;
        const oppDesc = 'Seeking student for Cypress testing.';
        const oppType = 'Research Assistant'; // Value for the select dropdown
    
        // 1. Click the "Post New Opportunity" button
        cy.get('[data-testid="post-opportunity-button"]').click();
    
        // 2. Fill in the form fields within the dialog
        cy.get('[data-testid="opportunity-form-dialog"]', { timeout: 5000 }).should('be.visible');
    
        cy.get('[data-testid="opportunity-title-input"]').find('input').type(oppTitle);
    
        // --- APPLY FIX FOR MULTILINE TEXTAREA ---
        cy.get('[data-testid="opportunity-description-input"]')
          .find('textarea')        // Find potentially multiple textareas
          .filter(':visible')      // Filter for the visible one(s)
          .first()                 // Explicitly take the first visible one
          .type(oppDesc, { force: true }); // Use force for robustness
        // --- END FIX ---
    
        // Handle Type Select Dropdown
        cy.get('[data-testid="opportunity-type-select"]').click(); // Click the FormControl/Select wrapper
        cy.get('ul[role="listbox"]').contains('li', oppType).click(); // Click the option
    
        // Handle Allow Interest Checkbox (Example: ensure it's checked)
        // Need to find the input nested inside the FormControlLabel
        cy.get('[data-testid="opportunity-allow-interest-checkbox"]')
          .find('input[type="checkbox"]')
          .check({ force: true }); // Force check
    
        // 3. Click the "Save" button (text is "Create Post")
        cy.get('[data-testid="opportunity-form-save-button"]').contains('Create Post').click();
    
        // 4. Assert the new opportunity appears in the list
        cy.get('[data-testid="opportunity-form-dialog"]').should('not.exist'); // Dialog closes
        cy.get('[data-testid="opportunity-list-container"]', { timeout: 10000 })
          .contains('[data-testid^="opportunity-item-title-"]', oppTitle) // Check if title appears
          .should('be.visible');
    
        // --- Cleanup ---
        cy.log('Cleaning up created opportunity...');
        cy.contains('[data-testid^="opportunity-list-item-"]', oppTitle)
          .find('[data-testid^="opportunity-item-delete-button-"]')
          .click();
        cy.on('window:confirm', () => true); // Assuming basic confirm
        cy.contains('[data-testid^="opportunity-item-title-"]', oppTitle).should('not.exist');
        // --- End Cleanup ---
    });
  
    // --- Placeholder Tests ---
    it('should display posted opportunities', () => {
      // TODO: Add opp, reload, check display
    });
  
    it('should allow editing an existing opportunity', () => {
      // TODO: Add opp, click edit, change fields, save, assert change, cleanup
    });
  
     it('should allow deleting an opportunity', () => {
      // TODO: Add opp, click delete, confirm, assert gone
     });
  
  });