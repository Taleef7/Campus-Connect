// frontend/tests/support/commands.js

/**
 * Logs in a user via the UI.
 * @param {string} userType - The type of user ('student' or 'professor') from fixtures/users.json
 */
Cypress.Commands.add('login', (userType) => {
    cy.log(`Logging in as ${userType}`);

    // Load credentials from fixture
    cy.fixture('users.json').then((users) => {
      const user = users[userType];
      if (!user) {
        throw new Error(`User type "${userType}" not found in fixtures/users.json`);
      }

      // Visit the auth page, ensuring login mode
      cy.visit('/auth', { state: { initialMode: 'login' } });
      cy.get('[data-testid="auth-paper"]', { timeout: 10000 }).should('be.visible');

      // Select the correct role toggle
      if (userType === 'student') {
        cy.get('[data-testid="role-student-button"]').should('have.attr', 'aria-pressed', 'true'); // Default, just check
      } else if (userType === 'professor') {
        cy.get('[data-testid="role-professor-button"]').click().should('have.attr', 'aria-pressed', 'true');
      }

      // Type credentials and submit
      cy.get('[data-testid="email-input"]').should('be.visible').type(user.email);
      cy.get('[data-testid="password-input"]').should('be.visible').type(user.password);
      cy.get('[data-testid="submit-button"]').should('be.visible').click();

      // Wait for navigation to the correct dashboard
      const dashboardUrl = userType === 'student' ? '/student-dashboard' : '/professor-dashboard';
      cy.url({ timeout: 15000 }).should('include', dashboardUrl); // Increased timeout slightly for login+redirect

      // Optional: Add a small wait for dashboard elements to settle after login
      // cy.wait(500);
    });
  });