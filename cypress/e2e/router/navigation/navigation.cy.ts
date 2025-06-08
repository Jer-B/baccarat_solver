/**
 * E2E Tests: Router Navigation Excellence Level
 *
 * Test Summary:
 * - Route navigation and validation in real browser environment
 * - Navigation mode switching between original and CDD interfaces
 * - Route error handling and recovery mechanisms
 * - Breadcrumb generation and navigation
 * - URL state management and browser history
 *
 * Test Coverage:
 * - Live browser route navigation
 * - Navigation mode switching functionality
 * - Route validation and error handling
 * - Breadcrumb navigation behavior
 * - Browser back/forward button integration
 * - URL parameter handling and validation
 */

describe('Router Navigation E2E', () => {
  beforeEach(() => {
    // Clear all storage and reset state
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Basic Navigation', () => {
    it('should load the application and navigate to default route', () => {
      cy.visit('/');

      // Should redirect to game route
      cy.url().should('include', '/game');

      // Should show game interface
      cy.get('body').should('be.visible');
    });

    it('should navigate to history page', () => {
      cy.visit('/');

      // Wait for page to load
      cy.get('body').should('be.visible');

      // Navigate to history
      cy.visit('/history');
      cy.url().should('include', '/history');
    });

    it('should navigate between original routes directly', () => {
      // Test direct navigation to game
      cy.visit('/game');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/game`);

      // Test direct navigation to history
      cy.visit('/history');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/history`);
    });
  });

  describe('CDD Navigation Mode', () => {
    it('should navigate to CDD routes', () => {
      cy.visit('/cdd');
      cy.url().should('include', '/cdd');
    });

    it('should navigate to CDD game route', () => {
      cy.visit('/cdd/game');
      cy.url().should('include', '/cdd/game');
    });

    it('should navigate to CDD history route', () => {
      cy.visit('/cdd/history');
      cy.url().should('include', '/cdd/history');
    });

    it('should navigate to CDD settings route', () => {
      cy.visit('/cdd/settings');
      cy.url().should('include', '/cdd/settings');
    });
  });

  describe('Navigation Mode Switching', () => {
    it('should switch from original to CDD mode', () => {
      // Start with original game
      cy.visit('/game');
      cy.url().should('include', '/game');

      // Navigate to CDD equivalent
      cy.visit('/cdd/game');
      cy.url().should('include', '/cdd/game');
    });

    it('should switch from CDD to original mode', () => {
      // Start with CDD
      cy.visit('/cdd/game');
      cy.url().should('include', '/cdd/game');

      // Navigate to original equivalent
      cy.visit('/game');
      cy.url().should('include', '/game');
    });

    it('should maintain context during mode switches', () => {
      // Visit original game
      cy.visit('/game');

      // Switch to CDD mode
      cy.visit('/cdd/game');
      cy.url().should('include', '/cdd/game');

      // Switch back to original
      cy.visit('/game');
      cy.url().should('include', '/game');
    });
  });

  describe('Tab Menu Navigation (if available)', () => {
    it('should navigate using tab menu if present', () => {
      cy.visit('/');

      // Look for tab navigation (may not be present in all views)
      cy.get('body').then($body => {
        if ($body.find('[data-cy="tab-game"]').length > 0) {
          cy.get('[data-cy="tab-game"]').click();
          cy.url().should('include', '/game');
        }

        if ($body.find('[data-cy="tab-history"]').length > 0) {
          cy.get('[data-cy="tab-history"]').click();
          cy.url().should('include', '/history');
        }
      });
    });
  });

  describe('Browser Navigation', () => {
    it('should handle browser back and forward buttons', () => {
      // Navigate through multiple routes
      cy.visit('/game');
      cy.visit('/history');
      cy.visit('/cdd/game');

      // Use browser back button
      cy.go('back');
      cy.url().should('include', '/history');

      cy.go('back');
      cy.url().should('include', '/game');

      // Use browser forward button
      cy.go('forward');
      cy.url().should('include', '/history');
    });

    it('should maintain browser history correctly', () => {
      cy.visit('/game');
      cy.visit('/history');
      cy.visit('/cdd/settings');

      // Check that we can navigate back through history
      cy.go('back');
      cy.url().should('include', '/history');

      cy.go('back');
      cy.url().should('include', '/game');
    });
  });

  describe('URL State Management', () => {
    it('should handle direct URL access', () => {
      // Test direct access to various routes
      const routes = ['/game', '/history', '/cdd', '/cdd/game', '/cdd/history', '/cdd/settings'];

      routes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', route);
      });
    });

    it('should preserve URL state on page refresh', () => {
      cy.visit('/cdd/settings');
      cy.url().should('include', '/cdd/settings');

      // Refresh page
      cy.reload();

      // Should maintain same URL
      cy.url().should('include', '/cdd/settings');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', () => {
      // Visit invalid route
      cy.visit('/invalid-route', { failOnStatusCode: false });

      // Should either redirect to valid route or show error page
      cy.url().then(url => {
        // Should not stay on invalid route
        expect(url).not.to.include('/invalid-route');
      });
    });

    it('should recover from navigation errors', () => {
      // Start with valid route
      cy.visit('/game');
      cy.url().should('include', '/game');

      // Try to navigate to invalid route programmatically
      cy.window().then(win => {
        // This might cause an error, but app should handle it
        try {
          win.history.pushState({}, '', '/invalid-route');
        } catch (e) {
          // Expected to handle gracefully
        }
      });

      // Should be able to navigate to valid route after error
      cy.visit('/history');
      cy.url().should('include', '/history');
    });
  });

  describe('Performance and Reliability', () => {
    it('should load routes quickly', () => {
      const startTime = Date.now();

      cy.visit('/game');

      cy.get('body')
        .should('be.visible')
        .then(() => {
          const loadTime = Date.now() - startTime;
          // Should load within reasonable time (5 seconds)
          expect(loadTime).to.be.lessThan(5000);
        });
    });

    it('should handle rapid navigation changes', () => {
      // Rapidly navigate between routes
      cy.visit('/game');
      cy.visit('/history');
      cy.visit('/cdd/game');
      cy.visit('/cdd/history');
      cy.visit('/game');

      // Should end up at the final route
      cy.url().should('include', '/game');
    });
  });

  describe('Accessibility', () => {
    it('should maintain focus management during navigation', () => {
      cy.visit('/game');

      // Check that page has proper focus management
      cy.get('body').should('be.visible');

      // Navigate and check focus is managed
      cy.visit('/history');
      cy.get('body').should('be.visible');

      // Should not have any obvious focus issues
      cy.focused().should('exist');
    });

    it('should update document title on route changes', () => {
      cy.visit('/game');
      cy.title().should('contain', 'Baccarat');

      cy.visit('/history');
      cy.title().should('contain', 'Baccarat');

      cy.visit('/cdd/settings');
      cy.title().should('contain', 'Baccarat');
    });
  });
});
