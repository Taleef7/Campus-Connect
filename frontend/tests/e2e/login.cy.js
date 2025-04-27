// frontend/tests/e2e/login.cy.js
/// <reference types="cypress" />
// This test suite is for the authentication page login flow of the web application.
describe('Authentication Page Login Flow', () => {
    beforeEach(() => {
      // Visit auth page, simulating clicking 'Login'
      cy.visit('/auth', { state: { initialMode: 'login' } });
      cy.get('[data-testid="auth-paper"]', { timeout: 10000 }).should('be.visible');
    });
  
    it('should successfully log in a student with correct credentials', () => {
      // Get credentials from environment variables
      const studentEmail = Cypress.env('STUDENT_EMAIL');
      const studentPassword = Cypress.env('STUDENT_PASSWORD');
  
      // Ensure Student role is selected
      cy.get('[data-testid="role-student-button"]').should('have.attr', 'aria-pressed', 'true');
  
      // Type credentials
      cy.get('[data-testid="email-input"]').should('be.visible').type(studentEmail);
      cy.get('[data-testid="password-input"]').should('be.visible').type(studentPassword);
  
      // Click submit
      cy.get('[data-testid="submit-button"]').should('be.visible').click();
  
      // Assert navigation to student dashboard
      cy.url({ timeout: 10000 }).should('include', '/student-dashboard');

      // Wait for the Tabs container to be visible first
      cy.get('.MuiTabs-root', { timeout: 10000 }).should('be.visible');
  
      cy.get('[data-testid="dashboard-welcome-message"]', { timeout: 10000 }).should('be.visible'); // Replace with your actual selector
    });
  
    it('should successfully log in a professor with correct credentials', () => {
      // Get credentials from environment variables
      const professorEmail = Cypress.env('PROFESSOR_EMAIL');
      const professorPassword = Cypress.env('PROFESSOR_PASSWORD');
  
      // Select Professor role
      cy.get('[data-testid="role-professor-button"]').should('be.visible').click();
      cy.get('[data-testid="role-professor-button"]').should('have.attr', 'aria-pressed', 'true'); // Verify selection
  
      // Type credentials
      cy.get('[data-testid="email-input"]').should('be.visible').type(professorEmail);
      cy.get('[data-testid="password-input"]').should('be.visible').type(professorPassword);
  
      // Click submit
      cy.get('[data-testid="submit-button"]').should('be.visible').click();
  
      // Assert navigation to professor dashboard
      cy.url({ timeout: 10000 }).should('include', '/professor-dashboard');
      cy.get('.MuiTabs-root', { timeout: 10000 }).should('be.visible');
      // Replace with an actual professor dashboard selector
      cy.get('[data-testid="professor-dashboard-welcome"]', { timeout: 10000 }).should('be.visible');
    });
  
    it('should show an error for invalid credentials', () => {
      // Get credentials from environment variables
      const invalidEmail = Cypress.env('INVALID_EMAIL');
      const invalidPassword = Cypress.env('INVALID_PASSWORD');
  
      // Ensure Student role is selected (or Professor, doesn't matter for invalid creds)
      cy.get('[data-testid="role-student-button"]').should('have.attr', 'aria-pressed', 'true');
  
      // Type invalid credentials
      cy.get('[data-testid="email-input"]').should('be.visible').type(invalidEmail);
      cy.get('[data-testid="password-input"]').should('be.visible').type(invalidPassword);
  
      // Click submit
      cy.get('[data-testid="submit-button"]').should('be.visible').click();
  
      // Assert URL is still /auth (no redirect)
      cy.url({ timeout: 1000 }).should('include', '/auth'); // Should stay on auth page

      // Wait for Snackbar container to appear
      cy.get('.MuiSnackbar-root', { timeout: 10000 }).should('be.visible');
  
      cy.get('.MuiAlert-message', { timeout: 1000 }).should('contain', 'Login failed: User profile not found.'); // Adjust this to match your error message
    });
  
    it('should show role mismatch error when logging in as student with professor role selected', () => {
      // Get VALID student credentials
      const studentEmail = Cypress.env('STUDENT_EMAIL');
      const studentPassword = Cypress.env('STUDENT_PASSWORD');
  
      // Select PROFESSOR role
      cy.get('[data-testid="role-professor-button"]').should('be.visible').click();
      cy.get('[data-testid="role-professor-button"]').should('have.attr', 'aria-pressed', 'true'); // Verify selection
  
      // Type STUDENT credentials
      cy.get('[data-testid="email-input"]').should('be.visible').type(studentEmail);
      cy.get('[data-testid="password-input"]').should('be.visible').type(studentPassword);
  
      // Click submit
      cy.get('[data-testid="submit-button"]').should('be.visible').click();
  
      // Assert URL is still /auth
      cy.url().should('include', '/auth');
  
      // Assert Snackbar/Alert with role mismatch error is visible
      cy.get('.MuiAlert-message', { timeout: 10000 })
        .should('be.visible')
        // Check for the specific error text your code throws
        .and('contain', 'Access denied. Account registered as a student, not professor.');
    });
  
    // Optional: Add another test case for logging in as professor with student role selected
    it('should show role mismatch error when logging in as professor with student role selected', () => {
        const professorEmail = Cypress.env('PROFESSOR_EMAIL');
        const professorPassword = Cypress.env('PROFESSOR_PASSWORD');
  
        // Ensure STUDENT role is selected
        cy.get('[data-testid="role-student-button"]').should('have.attr', 'aria-pressed', 'true');
  
        // Type PROFESSOR credentials
        cy.get('[data-testid="email-input"]').should('be.visible').type(professorEmail);
        cy.get('[data-testid="password-input"]').should('be.visible').type(professorPassword);
  
        // Click submit
        cy.get('[data-testid="submit-button"]').should('be.visible').click();
  
        // Assert URL is still /auth
        cy.url().should('include', '/auth');
  
        // Assert Snackbar/Alert with role mismatch error is visible
        cy.get('.MuiAlert-message', { timeout: 10000 })
          .should('be.visible')
          .and('contain', 'Access denied. Account registered as a professor, not student.');
    });
  
  });