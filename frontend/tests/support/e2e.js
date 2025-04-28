// frontend/tests/support/e2e.js
/* global Cypress */

import './commands';

// You can put other global configurations here
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // on certain non-critical errors (use with caution)
  // Example: Sometimes ResizeObserver errors can be ignored
  // if (err.message.includes('ResizeObserver loop limit exceeded')) {
  //   return false;
  // }
  // Allow other errors to fail the test
  return true;
});