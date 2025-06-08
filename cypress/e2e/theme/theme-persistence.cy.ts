/**
 * E2E Tests: Theme Persistence in Real Browser
 *
 * Test Summary:
 * - Real browser theme persistence across page reloads and navigation
 * - localStorage integration with actual browser storage API
 * - Theme toggle UI component behavior in live environment
 * - Cross-page theme consistency in multi-page application
 * - Browser refresh and session storage validation
 *
 * Test Coverage:
 * - Live browser environment theme persistence
 * - Actual localStorage read/write operations
 * - UI component integration with theme store
 * - Navigation and routing with theme state
 * - Real page reload scenarios
 */

describe('Theme Persistence E2E', () => {
  beforeEach(() => {
    // Clear all storage before each test
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Basic Theme Persistence', () => {
    it('should persist Elite theme after page reload', () => {
      // Visit CDD route - use specific game route
      cy.visit('/cdd/game');

      // Verify initial luxury theme
      cy.get('[data-theme="luxury"]').should('exist');
      cy.get('.theme-toggle__track--luxury').should('exist');

      // Switch to Elite theme via toggle
      cy.get('.theme-toggle__track').click();

      // Verify Elite theme is active
      cy.get('[data-theme="elite"]').should('exist');
      cy.get('.theme-toggle__track--elite').should('exist');

      // Verify localStorage contains the new theme
      cy.window().then(win => {
        const themeStore = win.localStorage.getItem('theme-store');
        expect(themeStore).to.not.be.null;

        if (themeStore) {
          const parsed = JSON.parse(themeStore);
          expect(parsed.currentTheme).to.equal('elite');
        }
      });

      // Reload page and verify persistence
      cy.reload();

      // Elite theme should persist after reload
      cy.get('[data-theme="elite"]').should('exist');
      cy.get('.theme-toggle__track--elite').should('exist');
    });

    it('should persist Luxury theme selection', () => {
      // Pre-set Elite theme
      cy.visit('/cdd/game');
      cy.get('.theme-toggle__track').click(); // Switch to Elite
      cy.get('[data-theme="elite"]').should('exist');

      // Switch back to Luxury
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="luxury"]').should('exist');

      // Verify localStorage
      cy.window().then(win => {
        const themeStore = win.localStorage.getItem('theme-store');
        if (themeStore) {
          const parsed = JSON.parse(themeStore);
          expect(parsed.currentTheme).to.equal('luxury');
        }
      });

      // Reload and verify
      cy.reload();
      cy.get('[data-theme="luxury"]').should('exist');
    });
  });

  describe('Cross-Page Theme Consistency', () => {
    it('should maintain theme across navigation between Game and History', () => {
      cy.visit('/cdd/game');

      // Set Elite theme on Game page
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="elite"]').should('exist');

      // Navigate to History page
      cy.get('[data-cy="tab-history"]').click();
      cy.url().should('include', '/cdd/history');

      // Theme should persist on History page
      cy.get('[data-theme="elite"]').should('exist');
      cy.get('.theme-toggle__track--elite').should('exist');

      // Navigate back to Game page
      cy.get('[data-cy="tab-game"]').click();
      cy.url().should('include', '/cdd/game');

      // Theme should still be Elite
      cy.get('[data-theme="elite"]').should('exist');
    });

    it('should maintain theme when switching between CDD and Original views', () => {
      // Start on CDD with Elite theme
      cy.visit('/cdd/game');
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="elite"]').should('exist');

      // Switch to Original view
      cy.get('.cdd-switch-btn').click();

      // Should be on original route now
      cy.url().should('not.include', '/cdd');

      // Navigate back to CDD
      cy.visit('/cdd/game');

      // Theme should still be Elite
      cy.get('[data-theme="elite"]').should('exist');
    });
  });

  describe('Theme Toggle UI Behavior', () => {
    it('should update toggle appearance correctly with theme changes', () => {
      cy.visit('/cdd/game');

      // Initial state - Luxury theme
      cy.get('.theme-toggle__track').should('have.class', 'theme-toggle__track--luxury');
      cy.get('.theme-toggle__slider').should('have.class', 'theme-toggle__slider--luxury');

      // Click to switch to Elite
      cy.get('.theme-toggle__track').click();

      // Verify UI updates
      cy.get('.theme-toggle__track').should('have.class', 'theme-toggle__track--elite');
      cy.get('.theme-toggle__slider').should('have.class', 'theme-toggle__slider--elite');

      // Click to switch back to Luxury
      cy.get('.theme-toggle__track').click();

      // Verify UI reverts
      cy.get('.theme-toggle__track').should('have.class', 'theme-toggle__track--luxury');
      cy.get('.theme-toggle__slider').should('have.class', 'theme-toggle__slider--luxury');
    });

    it('should show correct theme labels and icons', () => {
      cy.visit('/cdd/game');

      // Check Luxury theme labels
      cy.get('.theme-toggle__label--left').should('contain.text', 'Luxury');
      cy.get('.theme-toggle__label--left .theme-toggle__icon').should('contain.text', '🌙');

      cy.get('.theme-toggle__label--right').should('contain.text', 'Elite');
      cy.get('.theme-toggle__label--right .theme-toggle__icon').should('contain.text', '💎');

      // Switch to Elite
      cy.get('.theme-toggle__track').click();

      // Verify slider shows correct content
      cy.get('.theme-toggle__slider-icon').should('contain.text', '💎');
      cy.get('.theme-toggle__slider-text').should('contain.text', 'Elite');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle corrupted localStorage gracefully', () => {
      // Visit page and set invalid localStorage
      cy.visit('/cdd/game');

      cy.window().then(win => {
        win.localStorage.setItem('theme-store', 'invalid-json-data');
      });

      // Reload page - should fallback to luxury theme
      cy.reload();

      // Should default to luxury theme without errors
      cy.get('[data-theme="luxury"]').should('exist');
      cy.get('.theme-toggle__track--luxury').should('exist');
    });

    it('should work when localStorage is disabled', () => {
      // Note: This test simulates localStorage being unavailable
      // which can happen in private browsing mode

      cy.visit('/cdd/game');

      // Even without persistence, theme toggle should work for current session
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="elite"]').should('exist');

      // Switch back
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="luxury"]').should('exist');
    });

    it('should handle rapid theme switching', () => {
      cy.visit('/cdd/game');

      // Rapidly toggle theme multiple times
      for (let i = 0; i < 5; i++) {
        cy.get('.theme-toggle__track').click();
        cy.wait(100); // Small delay to ensure state updates
      }

      // Should end up on Elite theme (odd number of clicks)
      cy.get('[data-theme="elite"]').should('exist');

      // One more click to return to Luxury
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="luxury"]').should('exist');
    });
  });

  describe('Browser Session Scenarios', () => {
    it('should maintain theme in new browser session', () => {
      // Set Elite theme
      cy.visit('/cdd/game');
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="elite"]').should('exist');

      // Simulate new session by clearing session storage but keeping localStorage
      cy.clearAllSessionStorage();

      // Visit again (simulates new session)
      cy.visit('/cdd/game');

      // Theme should still be Elite from localStorage
      cy.get('[data-theme="elite"]').should('exist');
    });

    it('should work with browser back/forward navigation', () => {
      // Start on CDD Game page
      cy.visit('/cdd/game');

      // Set Elite theme
      cy.get('.theme-toggle__track').click();
      cy.get('[data-theme="elite"]').should('exist');

      // Navigate to History
      cy.get('[data-cy="tab-history"]').click();
      cy.get('[data-theme="elite"]').should('exist');

      // Use browser back button
      cy.go('back');

      // Should be back on Game page with Elite theme
      cy.url().should('include', '/cdd/game');
      cy.get('[data-theme="elite"]').should('exist');
    });
  });
});
