// / <reference types="cypress" />

describe('CDD Theme Persistence E2E', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();

    // Visit the CDD main route - it will redirect to /cdd/game
    cy.visit('/cdd/game', { timeout: 10000 });

    // Wait for page to load and header to be visible
    cy.get('[data-cy="cdd-header"]', { timeout: 15000 }).should('be.visible');
  });

  describe('CDD Route Theme Navigation', () => {
    it('should persist theme when navigating between CDD routes', () => {
      // Start on CDD game route (default redirect)
      cy.url().should('include', '/cdd/game');

      // Set Elite theme using the theme toggle
      cy.get('[data-cy="theme-toggle"]').click();

      // Verify Elite theme is active
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Navigate to CDD history
      cy.get('[data-cy="tab-history"]').click();
      cy.url().should('include', '/cdd/history');

      // Theme should persist
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Verify localStorage contains elite theme
      cy.window().then(win => {
        const stored = win.localStorage.getItem('theme-store');
        expect(stored).to.contain('elite');
      });
    });

    it('should restore theme on page refresh in CDD routes', () => {
      // Set Elite theme
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Navigate to CDD history
      cy.get('[data-cy="tab-history"]').click();

      // Refresh the page
      cy.reload();

      // Wait for page to load
      cy.get('[data-cy="cdd-header"]').should('be.visible');

      // Theme should be restored
      cy.get('html').should('have.attr', 'data-theme', 'elite');
      cy.url().should('include', '/cdd/history');
    });

    it('should maintain theme when switching between CDD and original routes', () => {
      // Set Elite theme on CDD route
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Navigate to original game route
      cy.get('[data-cy="switch-to-original"]').click();
      cy.url().should('include', '/game');
      cy.url().should('not.include', '/cdd');

      // Theme should persist
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Return to CDD route
      cy.visit('/cdd/game');
      cy.get('[data-cy="cdd-header"]').should('be.visible');

      // Theme should still be Elite
      cy.get('html').should('have.attr', 'data-theme', 'elite');
    });
  });

  describe('CDD Theme Toggle Functionality', () => {
    it('should toggle themes correctly on CDD routes', () => {
      // Start with Luxury theme (default)
      cy.get('html').should('have.attr', 'data-theme', 'luxury');

      // Toggle to Elite
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Toggle back to Luxury
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'luxury');

      // Verify final state in localStorage
      cy.window().then(win => {
        const stored = win.localStorage.getItem('theme-store');
        expect(stored).to.contain('luxury');
      });
    });

    it('should handle rapid theme switching on CDD routes', () => {
      // Perform multiple rapid toggles
      cy.get('[data-cy="theme-toggle"]').click(); // -> elite
      cy.get('[data-cy="theme-toggle"]').click(); // -> luxury
      cy.get('[data-cy="theme-toggle"]').click(); // -> elite
      cy.get('[data-cy="theme-toggle"]').click(); // -> luxury

      // Should end with luxury theme
      cy.get('html').should('have.attr', 'data-theme', 'luxury');

      // Navigate to verify persistence
      cy.get('[data-cy="tab-history"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'luxury');
    });
  });

  describe('CDD Theme Persistence Edge Cases', () => {
    it('should handle theme persistence with corrupted localStorage', () => {
      // Corrupt localStorage
      cy.window().then(win => {
        win.localStorage.setItem('theme-store', 'invalid-json');
      });

      // Refresh page
      cy.reload();
      cy.get('[data-cy="cdd-header"]').should('be.visible');

      // Should default to luxury theme
      cy.get('html').should('have.attr', 'data-theme', 'luxury');

      // Should still be able to change theme
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');
    });

    it('should handle theme switching with disabled localStorage', () => {
      // Note: Cypress doesn't easily allow disabling localStorage,
      // but we can test recovery from storage errors

      // Set a theme normally
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Clear localStorage to simulate storage failure
      cy.clearLocalStorage();

      // Theme should remain in memory until refresh
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // After refresh, should revert to default
      cy.reload();
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('html').should('have.attr', 'data-theme', 'luxury');
    });

    it('should handle direct navigation to CDD routes with stored theme', () => {
      // Set up Elite theme in localStorage before visiting
      cy.window().then(win => {
        win.localStorage.setItem('theme-store', JSON.stringify({ currentTheme: 'elite' }));
      });

      // Visit CDD history directly
      cy.visit('/cdd/history');
      cy.get('[data-cy="cdd-header"]').should('be.visible');

      // Should restore Elite theme
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Navigate to CDD game
      cy.get('[data-cy="tab-game"]').click();
      cy.url().should('include', '/cdd/game');

      // Theme should persist
      cy.get('html').should('have.attr', 'data-theme', 'elite');
    });
  });

  describe('CDD Theme Visual Verification', () => {
    it('should apply correct visual styles for Luxury theme on CDD routes', () => {
      // Ensure Luxury theme is active
      cy.get('html').should('have.attr', 'data-theme', 'luxury');

      // Check that CDD header has luxury styling
      cy.get('[data-cy="cdd-header"]').should('be.visible').and('have.class', 'cdd-header--luxury');

      // Check that tab menu has luxury styling
      cy.get('[data-cy="tab-menu"]').should('be.visible').and('have.class', 'cdd-tab-menu--luxury');
    });

    it('should apply correct visual styles for Elite theme on CDD routes', () => {
      // Switch to Elite theme
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Check that CDD header has elite styling
      cy.get('[data-cy="cdd-header"]').should('be.visible').and('have.class', 'cdd-header--elite');

      // Check that tab menu has elite styling
      cy.get('[data-cy="tab-menu"]').should('be.visible').and('have.class', 'cdd-tab-menu--elite');
    });

    it('should update theme toggle appearance when theme changes', () => {
      // Start with Luxury theme
      cy.get('html').should('have.attr', 'data-theme', 'luxury');
      cy.get('[data-cy="theme-toggle"]').should('contain', 'Luxury');

      // Switch to Elite theme
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'elite');
      cy.get('[data-cy="theme-toggle"]').should('contain', 'Elite');

      // Navigate to different CDD route
      cy.get('[data-cy="tab-history"]').click();

      // Toggle should still show Elite
      cy.get('[data-cy="theme-toggle"]').should('contain', 'Elite');
    });
  });

  describe('Performance and Timing', () => {
    it('should apply theme changes immediately on CDD routes', () => {
      // Measure theme change timing
      cy.get('[data-cy="theme-toggle"]').click();

      // Theme should change within reasonable time
      cy.get('html', { timeout: 1000 }).should('have.attr', 'data-theme', 'elite');

      // Visual changes should be immediate
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');
    });

    it('should handle theme initialization efficiently on CDD routes', () => {
      // Set up theme in localStorage
      cy.window().then(win => {
        win.localStorage.setItem('theme-store', JSON.stringify({ currentTheme: 'elite' }));
      });

      // Measure page load and theme application
      const start = Date.now();
      cy.visit('/cdd/game');

      cy.get('[data-cy="cdd-header"]')
        .should('be.visible')
        .then(() => {
          const loadTime = Date.now() - start;
          // Should load and apply theme within reasonable time
          expect(loadTime).to.be.lessThan(3000);
        });

      // Theme should be applied
      cy.get('html').should('have.attr', 'data-theme', 'elite');
    });
  });
});
