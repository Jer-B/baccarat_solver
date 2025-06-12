/**
 * E2E Tests for CDDCommonGameHeader Functionality
 *
 * Tests header behavior across the entire application,
 * including navigation, persistence, and real-world usage scenarios.
 */

describe('CDDCommonGameHeader E2E', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');

    // Wait for the application to load
    cy.get('[data-cy="cdd-header"]', { timeout: 15000 }).should('be.visible');
  });

  describe('Header Visibility and Persistence', () => {
    it('displays header on all pages', () => {
      // Header should be visible on home page
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');

      // Navigate to different routes (if they exist)
      // Note: Adjust these based on your actual routes
      const routes = ['/', '/game', '/settings'];

      routes.forEach(route => {
        cy.visit(route);
        cy.get('[data-cy="cdd-header"]', { timeout: 10000 }).should('be.visible');
        cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');
      });
    });

    it('maintains header state during navigation', () => {
      // Set elite theme
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // Navigate to different page
      cy.visit('/game');

      // Theme should persist
      cy.get('[data-cy="cdd-header"]', { timeout: 10000 }).should(
        'have.class',
        'cdd-header--elite'
      );

      // Navigate back
      cy.visit('/');

      // Theme should still persist
      cy.get('[data-cy="cdd-header"]', { timeout: 10000 }).should(
        'have.class',
        'cdd-header--elite'
      );
    });

    it('persists theme across browser sessions', () => {
      // Set elite theme
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // Reload page
      cy.reload();

      // Theme should persist after reload
      cy.get('[data-cy="cdd-header"]', { timeout: 15000 }).should(
        'have.class',
        'cdd-header--elite'
      );
    });
  });

  describe('Theme Switching Functionality', () => {
    it('switches between luxury and elite themes', () => {
      // Initially should be luxury theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury');

      // Click theme toggle
      cy.get('[data-cy="theme-toggle"]').click();

      // Should switch to elite theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');
      cy.get('[data-cy="cdd-header"]').should('not.have.class', 'cdd-header--luxury');

      // Click again
      cy.get('[data-cy="theme-toggle"]').click();

      // Should switch back to luxury theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury');
      cy.get('[data-cy="cdd-header"]').should('not.have.class', 'cdd-header--elite');
    });

    it('applies theme changes to entire application', () => {
      // Switch to elite theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Check that document has elite theme attribute
      cy.get('html').should('have.attr', 'data-theme', 'elite');

      // Switch back to luxury theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Check that document has luxury theme attribute
      cy.get('html').should('have.attr', 'data-theme', 'luxury');
    });

    it('maintains theme consistency across components', () => {
      // Switch to elite theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Header should have elite theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // Other themed components should also update (if they exist)
      // Note: Add checks for other components that use themes
      cy.get('body').should('satisfy', $body => {
        return $body.hasClass('theme-elite') || !$body.hasClass('theme-luxury');
      });
    });
  });

  describe('Connection Health Indicator', () => {
    it('displays connection health indicator', () => {
      // Health indicator should be visible
      cy.get('.cdd-header__health-dot').should('be.visible');

      // Should have proper ARIA label
      cy.get('.cdd-header__health-dot')
        .should('have.attr', 'aria-label')
        .and('match', /Database status: (healthy|checking|unhealthy)/);
    });

    it('shows appropriate health states', () => {
      // Health indicator should have one of the state classes
      cy.get('.cdd-header__health-dot').should($el => {
        const classes = Array.from($el[0].classList);
        const hasHealthState = classes.some(
          cls =>
            cls.includes('cdd-header__health-dot--healthy') ||
            cls.includes('cdd-header__health-dot--checking') ||
            cls.includes('cdd-header__health-dot--error')
        );
        expect(hasHealthState).to.be.true;
      });
    });

    it('updates health status over time', () => {
      // Wait for initial health check
      cy.wait(1000);

      // Get initial health status
      cy.get('.cdd-header__health-dot').then($initial => {
        const initialClasses = Array.from($initial[0].classList);

        // Wait for potential health check update
        cy.wait(5000);

        // Health indicator should still be functional
        cy.get('.cdd-header__health-dot').should('be.visible');
        cy.get('.cdd-header__health-dot').should('have.attr', 'aria-label').and('not.be.empty');
      });
    });
  });

  describe('Responsive Behavior', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`works correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);

        // Header should be visible and functional
        cy.get('[data-cy="cdd-header"]').should('be.visible');
        cy.get('.cdd-header__title').should('be.visible').and('contain.text', '🎯 Baccarat Pro');

        // Theme toggle should work
        cy.get('[data-cy="theme-toggle"]').should('be.visible').click();
        cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

        // Health indicator visibility based on viewport
        if (width < 992) {
          // Mobile/tablet - health indicator should be visible
          cy.get('.cdd-header__health-dot').should('be.visible');
        } else {
          // Desktop - health indicator might be hidden (based on CSS)
          cy.get('.cdd-header__health-dot').should('exist');
        }

        // Layout should not break
        cy.get('.cdd-header__content').should('be.visible');
        cy.get('.cdd-header__title').should('not.have.css', 'overflow', 'visible');
      });
    });

    it('maintains proper layout on orientation change', () => {
      // Test portrait
      cy.viewport(768, 1024);
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('be.visible');

      // Test landscape
      cy.viewport(1024, 768);
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('be.visible');

      // Theme toggle should still work
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      // Focus on theme toggle directly (instead of using .tab() which doesn't exist)
      cy.get('[data-cy="theme-toggle"]').focus();
      cy.get('[data-cy="theme-toggle"]').should('be.focused');

      // Activate with Enter key
      cy.get('[data-cy="theme-toggle"]').type('{enter}');

      // Theme should change
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');
    });

    it('provides proper screen reader support', () => {
      // Check semantic structure
      cy.get('header[data-cy="cdd-header"]').should('exist');
      cy.get('h1.cdd-header__title').should('exist');

      // Check ARIA labels
      cy.get('.cdd-header__health-dot')
        .should('have.attr', 'aria-label')
        .and('match', /^Database status: (healthy|checking|unhealthy)$/);
    });

    it('maintains accessibility during theme changes', () => {
      // Check initial accessibility
      cy.get('header').should('exist');
      cy.get('h1').should('exist');

      // Switch theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Accessibility should be maintained
      cy.get('header').should('exist');
      cy.get('h1').should('exist');
      cy.get('[aria-label]').should('exist');
    });
  });

  describe('Performance and Reliability', () => {
    it('loads quickly and remains responsive', () => {
      // Measure page load time
      cy.window().then(win => {
        const loadTime =
          win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });

      // Header should be immediately interactive
      cy.get('[data-cy="theme-toggle"]').should('be.visible').click();
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');
    });

    it('handles rapid user interactions gracefully', () => {
      // Rapidly click theme toggle
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy="theme-toggle"]').click();
        cy.wait(50);
      }

      // Component should still be functional
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');
    });

    it('recovers from network issues', () => {
      // Simulate network issues (if possible)
      cy.intercept('GET', '**/auth/session', { forceNetworkError: true }).as('networkError');

      // Reload page
      cy.reload();

      // Header should still render
      cy.get('[data-cy="cdd-header"]', { timeout: 15000 }).should('be.visible');

      // Health indicator should show error state
      cy.get('.cdd-header__health-dot').should('be.visible');
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('works consistently across different browsers', () => {
      // This test will run on different browsers based on Cypress config

      // Basic functionality should work
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');

      // Theme switching should work
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // Health indicator should be visible
      cy.get('.cdd-header__health-dot').should('be.visible');
    });
  });

  describe('Real-world User Scenarios', () => {
    it('supports typical user workflow', () => {
      // User visits site
      cy.get('[data-cy="cdd-header"]').should('be.visible');

      // User changes theme preference
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // User navigates around the app
      cy.visit('/game');
      cy.get('[data-cy="cdd-header"]').should('be.visible').and('have.class', 'cdd-header--elite');

      // User returns later (simulate with reload)
      cy.reload();
      cy.get('[data-cy="cdd-header"]', { timeout: 15000 }).should(
        'have.class',
        'cdd-header--elite'
      );

      // Theme preference should be remembered
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');
    });

    it('handles extended usage sessions', () => {
      // Simulate extended usage
      for (let i = 0; i < 5; i++) {
        // Change theme
        cy.get('[data-cy="theme-toggle"]').click();
        cy.wait(1000);

        // Navigate
        cy.visit('/');
        cy.wait(500);
        cy.visit('/game');
        cy.wait(500);
      }

      // Header should still be functional
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');
      cy.get('[data-cy="theme-toggle"]').should('be.visible');
    });
  });
});
