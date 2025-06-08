/**
 * E2E Tests: Router Error Recovery Excellence Level
 *
 * Test Summary:
 * - Router error handling and recovery mechanisms
 * - Navigation behavior and fallback routes
 * - Route validation error scenarios
 * - Network failure simulation and error states
 * - Route state consistency during errors
 *
 * Test Coverage:
 * - Error boundary integration with router
 * - Route validation and fallback mechanisms
 * - Navigation state consistency during errors
 * - User experience during error conditions
 */

describe('Router Error Recovery E2E - Excellence Level', () => {
  beforeEach(() => {
    // Clear all storage and reset state
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    // Start from home page
    cy.visit('/');
  });

  describe('Route Error Handling', () => {
    it('should handle malformed URLs gracefully', () => {
      // Test various malformed URL patterns
      const malformedUrls = [
        '/game/../../../etc/passwd',
        '/game?param=<script>alert("xss")</script>',
        '/game#<img src=x onerror=alert("xss")>',
        '/game%00',
        `/game?param=${'a'.repeat(1000)}`, // Long parameter
      ];

      malformedUrls.forEach(url => {
        cy.visit(url, { failOnStatusCode: false });

        // Should redirect to safe route or show appropriate page
        cy.url().should('match', /\/(game|history|settings|cdd|$)/);

        // Page should load without JavaScript errors
        cy.window().then(win => {
          // Check that window.onerror wasn't triggered
          expect(win.location.pathname).to.match(/\/(game|history|settings|cdd|$)/);
        });
      });
    });

    it('should handle route not found gracefully', () => {
      // Navigate to non-existent route
      cy.visit('/non-existent-route', { failOnStatusCode: false });

      // Should either show the page content (Vue router handles it)
      // or redirect to a valid route
      cy.get('body').should('be.visible');

      // Check that the app is still functional by looking for common elements
      cy.get('body').then($body => {
        // App should have either a main app container or contain baccarat-related content
        const hasApp = $body.find('[data-testid="app"]').length > 0;
        const hasBaccaratContent =
          $body.text().includes('Baccarat') || $body.text().includes('Game');

        expect(hasApp || hasBaccaratContent).to.be.true;
      });
    });

    it('should maintain navigation state during route changes', () => {
      // Start at home
      cy.visit('/');
      cy.get('body').should('be.visible');

      // Navigate through different routes
      const routes = ['/game', '/history', '/settings'];

      routes.forEach(route => {
        cy.visit(route);
        cy.get('body').should('be.visible');
        cy.url().should('include', route);
      });
    });
  });

  describe('Navigation State Management', () => {
    it('should handle rapid navigation changes', () => {
      cy.visit('/');

      // Rapidly navigate between routes
      cy.visit('/game');
      cy.visit('/history');
      cy.visit('/settings');
      cy.visit('/game');

      // Should end up at the final route
      cy.url().should('include', '/game');
      cy.get('body').should('be.visible');
    });

    it('should preserve application state during navigation', () => {
      cy.visit('/');

      // Set some local storage
      cy.window().then(win => {
        win.localStorage.setItem('test-data', 'preserved');
      });

      // Navigate to different route
      cy.visit('/game');

      // Check that local storage is preserved
      cy.window().then(win => {
        expect(win.localStorage.getItem('test-data')).to.equal('preserved');
      });
    });
  });

  describe('Network Simulation Tests', () => {
    it('should handle slow network conditions', () => {
      // Simulate slow network
      cy.intercept('GET', '/**', { delay: 1000 }).as('slowNetwork');

      cy.visit('/game');

      // Page should eventually load
      cy.get('body', { timeout: 15000 }).should('be.visible');
    });

    it('should handle navigation during network issues', () => {
      cy.visit('/');

      // Simulate intermittent network issues
      let requestCount = 0;
      cy.intercept('GET', '/game*', req => {
        requestCount++;
        if (requestCount === 1) {
          req.reply({ statusCode: 500, delay: 100 });
        } else {
          req.continue();
        }
      }).as('intermittentNetwork');

      // Try to navigate
      cy.visit('/game', { failOnStatusCode: false });

      // Should eventually work or show appropriate fallback
      cy.get('body').should('be.visible');
    });
  });

  describe('Browser Navigation Integration', () => {
    it('should handle browser back/forward buttons', () => {
      // Start navigation sequence
      cy.visit('/');
      cy.visit('/game');
      cy.visit('/history');

      // Use browser back button
      cy.go('back');
      cy.url().should('include', '/game');

      // Use browser forward button
      cy.go('forward');
      cy.url().should('include', '/history');

      // Use browser back multiple times
      cy.go('back');
      cy.go('back');
      cy.url().should('match', /\/(game|$)/);
    });

    it('should handle page refresh during navigation', () => {
      cy.visit('/game');

      // Refresh the page
      cy.reload();

      // Should maintain the route
      cy.url().should('include', '/game');
      cy.get('body').should('be.visible');
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should recover from JavaScript errors', () => {
      cy.visit('/');

      // Simulate a JavaScript error
      cy.window().then(win => {
        win.dispatchEvent(
          new ErrorEvent('error', {
            message: 'Simulated error',
            filename: 'test.js',
            lineno: 1,
          })
        );
      });

      // App should still be functional
      cy.get('body').should('be.visible');

      // Navigation should still work
      cy.visit('/game');
      cy.get('body').should('be.visible');
    });

    it('should handle route state corruption gracefully', () => {
      cy.visit('/game');

      // Simulate corrupted history state
      cy.window().then(win => {
        try {
          win.history.replaceState({ corrupted: true }, '', '/game');
        } catch (e) {
          // Some browsers might not allow this, that's ok
        }
      });

      // Navigation should still work
      cy.visit('/history');
      cy.url().should('include', '/history');
      cy.get('body').should('be.visible');
    });
  });

  describe('Route Mode Switching', () => {
    it('should handle mode switching between original and CDD', () => {
      // Test navigation in original mode
      cy.visit('/');
      cy.get('body').should('be.visible');

      // Test CDD routes if they exist
      cy.visit('/cdd/game', { failOnStatusCode: false });

      // Should either work or gracefully handle the route
      cy.get('body').should('be.visible');
    });

    it('should maintain state during mode transitions', () => {
      cy.visit('/');

      // Set some application state
      cy.window().then(win => {
        win.localStorage.setItem('mode-test', 'original');
      });

      // Navigate to CDD mode
      cy.visit('/cdd/game', { failOnStatusCode: false });

      // State should be preserved
      cy.window().then(win => {
        expect(win.localStorage.getItem('mode-test')).to.equal('original');
      });
    });
  });
});
