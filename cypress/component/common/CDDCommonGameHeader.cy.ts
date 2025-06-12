/**
 * Cypress Component Tests for CDDCommonGameHeader
 *
 * Tests visual rendering, responsive behavior, theme switching,
 * and user interactions in isolated component environment.
 */

import { mount } from 'cypress/vue';
import { createPinia } from 'pinia';
import CDDCommonGameHeader from '../../../src/components/common/CDDCommonGameHeader.vue';
import { useThemeStore } from '../../../src/stores/themeStore';

// Add TypeScript declarations for cypress-image-snapshot
declare global {
  namespace Cypress {
    interface Chainable {
      matchImageSnapshot(name?: string): Chainable<Element>;
      matchImageSnapshot(options: any): Chainable<Element>;
      matchImageSnapshot(name: string, options: any): Chainable<Element>;
    }
  }
}

describe('CDDCommonGameHeader Component', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
  });

  // Fix TypeScript error with proper typing
  const mountComponent = (options: any = {}) => {
    return mount(CDDCommonGameHeader, {
      global: {
        plugins: [pinia],
        ...(options.global || {}),
      },
      ...options,
    });
  };

  describe('Visual Rendering', () => {
    it('renders correctly with luxury theme', () => {
      mountComponent();

      // Header should be visible
      cy.get('[data-cy="cdd-header"]').should('be.visible');

      // Should have luxury theme class
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury');

      // Title should be visible and correct
      cy.get('.cdd-header__title').should('be.visible').and('contain.text', '🎯 Baccarat Pro');

      // Theme toggle should be present
      cy.get('[data-cy="theme-toggle"]').should('be.visible');

      // Health indicator should be visible (updated selector)
      cy.get('.cdd-header__health-dot').should('exist');
    });

    it('renders correctly with elite theme', () => {
      mountComponent();

      // Switch to elite theme
      cy.window().then(win => {
        const store = useThemeStore(pinia);
        store.setEliteTheme();
      });

      // Should have elite theme class
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // All elements should still be visible
      cy.get('.cdd-header__title').should('be.visible');
      cy.get('[data-cy="theme-toggle"]').should('be.visible');
      cy.get('.cdd-header__health-dot').should('exist');
    });

    it('displays health indicator with correct states', () => {
      mountComponent();

      cy.get('.cdd-header__health-dot').should('exist');

      // Should have one of the health state classes
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

      // Should have ARIA label
      cy.get('.cdd-header__health-dot')
        .should('have.attr', 'aria-label')
        .and('match', /Database status: (healthy|checking|unhealthy)/);
    });
  });

  describe('Theme Switching', () => {
    it('switches themes when toggle is clicked', () => {
      mountComponent();

      // Initially luxury theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury');

      // Click theme toggle
      cy.get('[data-cy="theme-toggle"]').click();

      // Should switch to elite theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');

      // Click again
      cy.get('[data-cy="theme-toggle"]').click();

      // Should switch back to luxury theme
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury');
    });

    it('maintains visual consistency during theme changes', () => {
      mountComponent();

      // Check initial layout
      cy.get('.cdd-header__title').should('be.visible');
      cy.get('.cdd-header__health-dot').should('exist');
      cy.get('[data-cy="theme-toggle"]').should('be.visible');

      // Switch theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Layout should remain consistent
      cy.get('.cdd-header__title').should('be.visible');
      cy.get('.cdd-header__health-dot').should('exist');
      cy.get('[data-cy="theme-toggle"]').should('be.visible');

      // Title text should remain the same
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');
    });

    it('applies correct CSS styles for each theme', () => {
      mountComponent();

      // Test luxury theme styles
      cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury').and('be.visible');

      // Switch to elite theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Test elite theme styles
      cy.get('[data-cy="cdd-header"]')
        .should('have.class', 'cdd-header--elite')
        .and('not.have.class', 'cdd-header--luxury');
    });
  });

  describe('Responsive Behavior', () => {
    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`renders correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);
        mountComponent();

        // Header should be visible
        cy.get('[data-cy="cdd-header"]').should('be.visible');

        // Title should be visible and not overflow
        cy.get('.cdd-header__title').should('be.visible').and('contain.text', '🎯 Baccarat Pro');

        // Theme toggle should be visible
        cy.get('[data-cy="theme-toggle"]').should('be.visible');

        // Health indicator should exist
        cy.get('.cdd-header__health-dot').should('exist');

        // Check that header container is visible (updated selector)
        cy.get('[data-cy="cdd-header"]').should('be.visible');
      });
    });

    it('maintains proper layout proportions across viewports', () => {
      const testViewport = (width: number, height: number) => {
        cy.viewport(width, height);

        // Header should maintain proper structure
        cy.get('[data-cy="cdd-header"]').should('be.visible');

        // Title should be visible
        cy.get('.cdd-header__title').should('be.visible');

        // Theme toggle should be visible
        cy.get('[data-cy="theme-toggle"]').should('be.visible');
      };

      // Test multiple viewports
      testViewport(375, 667); // Mobile
      testViewport(768, 1024); // Tablet
      testViewport(1280, 720); // Desktop
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      mountComponent();

      // Should use semantic header element
      cy.get('header[data-cy="cdd-header"]').should('exist');

      // Title should be h1
      cy.get('h1.cdd-header__title').should('exist');

      // Health indicator should have ARIA label
      cy.get('.cdd-header__health-dot').should('have.attr', 'aria-label').and('not.be.empty');
    });

    it('supports keyboard navigation', () => {
      mountComponent();

      // Theme toggle should be accessible (look for button or focusable element)
      cy.get('[data-cy="theme-toggle"]').should('be.visible');

      // Try to find a focusable element within the toggle
      cy.get('[data-cy="theme-toggle"]')
        .find('button, [tabindex="0"], [role="button"]')
        .first()
        .should('exist');
    });

    it('provides meaningful ARIA labels', () => {
      mountComponent();

      // Health indicator ARIA label should be descriptive
      cy.get('.cdd-header__health-dot')
        .should('have.attr', 'aria-label')
        .and('match', /^Database status: (healthy|checking|unhealthy)$/);
    });

    it('maintains accessibility during theme changes', () => {
      mountComponent();

      // Check initial accessibility
      cy.get('header').should('exist');
      cy.get('h1').should('exist');
      cy.get('[aria-label]').should('exist');

      // Switch theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Accessibility should be maintained
      cy.get('header').should('exist');
      cy.get('h1').should('exist');
      cy.get('[aria-label]').should('exist');
    });
  });

  describe('User Interactions', () => {
    it('responds to theme toggle clicks', () => {
      mountComponent();

      // Get initial theme
      cy.get('[data-cy="cdd-header"]').then($header => {
        const isLuxury = $header.hasClass('cdd-header--luxury');

        // Click toggle
        cy.get('[data-cy="theme-toggle"]').click();

        // Theme should change
        if (isLuxury) {
          cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--elite');
        } else {
          cy.get('[data-cy="cdd-header"]').should('have.class', 'cdd-header--luxury');
        }
      });
    });

    it('handles rapid theme switching', () => {
      mountComponent();

      // Rapidly click theme toggle multiple times
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="theme-toggle"]').click();
        cy.wait(100);
      }

      // Component should still be stable
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('contain.text', '🎯 Baccarat Pro');
    });

    it('maintains state during multiple interactions', () => {
      mountComponent();

      // Perform various interactions
      cy.get('[data-cy="theme-toggle"]').click();
      cy.get('.cdd-header__title').click();
      cy.get('[data-cy="theme-toggle"]').click();

      // Component should remain functional
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.get('.cdd-header__title').should('be.visible');
      cy.get('[data-cy="theme-toggle"]').should('be.visible');
    });
  });

  describe('Visual Regression', () => {
    it('matches luxury theme visual snapshot', () => {
      mountComponent();

      // Take screenshot for luxury theme
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.matchImageSnapshot('header-luxury-theme');
    });

    it('matches elite theme visual snapshot', () => {
      mountComponent();

      // Switch to elite theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Take screenshot for elite theme
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.matchImageSnapshot('header-elite-theme');
    });

    it('matches responsive layouts', () => {
      mountComponent();

      // Test mobile layout
      cy.viewport(375, 667);
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.matchImageSnapshot('header-mobile');

      // Test tablet layout
      cy.viewport(768, 1024);
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.matchImageSnapshot('header-tablet');

      // Test desktop layout
      cy.viewport(1280, 720);
      cy.get('[data-cy="cdd-header"]').should('be.visible');
      cy.matchImageSnapshot('header-desktop');
    });
  });

  describe('Performance', () => {
    it('renders quickly without performance issues', () => {
      const startTime = performance.now();

      mountComponent();

      cy.get('[data-cy="cdd-header"]')
        .should('be.visible')
        .then(() => {
          const endTime = performance.now();
          const renderTime = endTime - startTime;

          // Should render within reasonable time (less than 200ms)
          expect(renderTime).to.be.lessThan(200);
        });
    });

    it('handles theme switching without performance degradation', () => {
      mountComponent();

      // Measure theme switching performance
      cy.window().then(win => {
        const startTime = win.performance.now();

        cy.get('[data-cy="theme-toggle"]')
          .click()
          .then(() => {
            const endTime = win.performance.now();
            const switchTime = endTime - startTime;

            // Theme switching should be fast (less than 100ms - more realistic)
            expect(switchTime).to.be.lessThan(100);
          });
      });
    });
  });
});
