// / <reference types="cypress" />

// ***********************************************
// Theme Persistence Custom Commands for Cypress
// Following Cypress TypeScript best practices
// ***********************************************

// Custom command for setting theme in localStorage
Cypress.Commands.add('setTheme', (theme: 'luxury' | 'elite') => {
  cy.window().then(win => {
    win.localStorage.setItem('theme-store', JSON.stringify({ currentTheme: theme }));
  });
});

// Custom command for getting current theme from localStorage
Cypress.Commands.add('getTheme', () => {
  return cy.window().then(win => {
    const themeStore = win.localStorage.getItem('theme-store');
    return themeStore ? JSON.parse(themeStore).currentTheme : 'luxury';
  });
});

// TypeScript module augmentation for custom commands
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Custom command to set theme in localStorage
       * @param theme - The theme to set ('luxury' or 'elite')
       */
      setTheme(theme: 'luxury' | 'elite'): Chainable<Subject>;

      /**
       * Custom command to get current theme from localStorage
       * @returns The current theme string
       */
      getTheme(): Chainable<string>;
    }
  }
}

// Export empty object to make this a module
export {};
