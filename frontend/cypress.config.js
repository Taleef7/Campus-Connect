/* eslint-disable no-unused-vars */
/* global process */
// frontend/cypress.config.js (or .ts)
import { defineConfig } from "cypress";
import dotenv from 'dotenv'; // Import dotenv

// Load variables from .env file in the current directory (frontend)
dotenv.config({ path: '.env' });

export default defineConfig({

  env: {
    STUDENT_EMAIL: process.env.CYPRESS_STUDENT_EMAIL,
    STUDENT_PASSWORD: process.env.CYPRESS_STUDENT_PASSWORD,
    PROFESSOR_EMAIL: process.env.CYPRESS_PROFESSOR_EMAIL,
    PROFESSOR_PASSWORD: process.env.CYPRESS_PROFESSOR_PASSWORD,
    INVALID_EMAIL: process.env.CYPRESS_INVALID_EMAIL,
    INVALID_PASSWORD: process.env.CYPRESS_INVALID_PASSWORD,
  },

  e2e: {
    // Base URL of your frontend application when running locally
    baseUrl: 'http://localhost:5173', // Or your dev port
    // Tell Cypress to look for test specs (files) inside frontend/tests/e2e
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Tell Cypress where support files (commands, etc.) are
    supportFile: 'tests/support/e2e.{js,ts}',
    // Tell Cypress where fixture files (test data) are
    fixturesFolder: 'tests/fixtures',
    // Recommended setting for modern Cypress
    experimentalRunAllSpecs: true,

    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
      // We loaded dotenv outside, so usually no need to do it here
      // IMPORTANT: return the config object
      return config;
    },
  },

  // Component testing (optional, but good practice to configure if you might use it later)
  // component: {
  //   devServer: {
  //     framework: "react",
  //     bundler: "vite",
  //   },
  //   specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}', // Or place component tests alongside components
  //   supportFile: 'tests/support/component.{js,ts}',
  // },
});