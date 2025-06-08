/**
 * Cypress E2E Testing Support
 *
 * This file is processed and loaded automatically before E2E test files.
 *
 * Configuration for end-to-end testing of the Vue Router system.
 */

// / <reference types="cypress" />

// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Code coverage support
import '@cypress/code-coverage/support';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Cypress E2E configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // This is useful for testing error handling scenarios
  console.log('Uncaught exception:', err.message);

  // Return false to prevent the error from failing the test
  // Only for specific errors we want to handle gracefully
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Global before hook for E2E tests
beforeEach(() => {
  // Clear any previous state
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();

  // Set viewport for consistent testing
  cy.viewport(1280, 720);
});

// Custom commands for router testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Navigate to a route and wait for it to load
       */
      navigateAndWait(path: string): Chainable<Element>;

      /**
       * Check if current URL matches expected path
       */
      shouldBeAtRoute(path: string): Chainable<Element>;

      /**
       * Wait for router to be ready
       */
      waitForRouter(): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('navigateAndWait', (path: string) => {
  cy.visit(path);
  cy.get('body').should('be.visible');
  cy.url().should('include', path);
});

Cypress.Commands.add('shouldBeAtRoute', (path: string) => {
  cy.url().should('include', path);
});

Cypress.Commands.add('waitForRouter', () => {
  cy.get('body').should('be.visible');
  cy.wait(100); // Small wait for router to settle
});
