/**
 * Component Tests: useRouter Composable - Excellence Level
 *
 * Tests the useRouter composable in isolation using Cypress Component Testing.
 * Focuses on the composable's reactive properties, methods, and state management.
 */

import { ref } from 'vue';
import { useRouter } from '../../../src/composables/useRouter';
import { ROUTE_PATHS, ROUTE_NAMES } from '../../../src/types/core/routeTypes';

describe('useRouter Composable - Excellence Level', () => {
  it('should initialize with correct default state', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        return { router };
      },
      template: `
        <div data-cy="router-test">
          <div data-cy="current-path">{{ router.currentPath }}</div>
          <div data-cy="current-mode">{{ router.currentMode }}</div>
          <div data-cy="is-navigating">{{ router.isNavigating }}</div>
          <div data-cy="navigation-error">{{ router.navigationError || 'none' }}</div>
        </div>
      `,
    });

    // Verify initial state
    cy.get('[data-cy="current-path"]').should('contain', '/');
    cy.get('[data-cy="current-mode"]').should('contain', 'original');
    cy.get('[data-cy="is-navigating"]').should('contain', 'false');
    cy.get('[data-cy="navigation-error"]').should('contain', 'none');
  });

  it('should provide navigation methods', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        const testResult = ref('pending');

        const testNavigation = async () => {
          try {
            await router.navigateTo(ROUTE_PATHS.ORIGINAL_HISTORY);
            testResult.value = 'success';
          } catch (error) {
            testResult.value = 'error';
          }
        };

        return { router, testResult, testNavigation };
      },
      template: `
        <div data-cy="router-test">
          <button 
            @click="testNavigation()"
            data-cy="navigate-btn"
          >
            Navigate to History
          </button>
          <div data-cy="test-result">{{ testResult }}</div>
          <div data-cy="navigation-error">{{ router.navigationError || 'none' }}</div>
        </div>
      `,
    });

    // Test navigation method exists and can be called
    cy.get('[data-cy="navigate-btn"]').click();
    cy.get('[data-cy="test-result"]').should('not.contain', 'pending');
    cy.get('[data-cy="navigation-error"]').should('contain', 'none');
  });

  it('should generate breadcrumbs correctly', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        return { router };
      },
      template: `
        <div data-cy="router-test">
          <ul data-cy="breadcrumbs">
            <li 
              v-for="(crumb, index) in router.breadcrumbs" 
              :key="index"
              :data-cy="\`breadcrumb-\${index}\`"
            >
              {{ crumb.name }} ({{ crumb.path }})
            </li>
          </ul>
        </div>
      `,
    });

    // Verify breadcrumbs are generated
    cy.get('[data-cy="breadcrumbs"]').should('exist');
    cy.get('[data-cy="breadcrumb-0"]').should('exist');
  });

  it('should switch navigation modes', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        const modeResult = ref('pending');

        const switchToCDD = async () => {
          try {
            await router.switchNavigationMode('cdd');
            modeResult.value = 'cdd-success';
          } catch (error) {
            modeResult.value = 'cdd-error';
          }
        };

        const switchToOriginal = async () => {
          try {
            await router.switchNavigationMode('original');
            modeResult.value = 'original-success';
          } catch (error) {
            modeResult.value = 'original-error';
          }
        };

        return { router, modeResult, switchToCDD, switchToOriginal };
      },
      template: `
        <div data-cy="router-test">
          <div data-cy="current-mode">{{ router.currentMode }}</div>
          <div data-cy="mode-result">{{ modeResult }}</div>
          <button 
            @click="switchToCDD()"
            data-cy="switch-cdd-btn"
          >
            Switch to CDD
          </button>
          <button 
            @click="switchToOriginal()"
            data-cy="switch-original-btn"
          >
            Switch to Original
          </button>
        </div>
      `,
    });

    // Test mode switching
    cy.get('[data-cy="current-mode"]').should('contain', 'original');
    cy.get('[data-cy="switch-cdd-btn"]').click();
    cy.get('[data-cy="mode-result"]').should('contain', 'cdd');
    cy.get('[data-cy="switch-original-btn"]').click();
    cy.get('[data-cy="mode-result"]').should('contain', 'original');
  });

  it('should validate routes with canNavigateTo', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        const validationResults = ref({
          validRoute: null as boolean | null,
          invalidRoute: null as boolean | null,
        });

        const testValidation = () => {
          validationResults.value.validRoute = router.canNavigateTo(ROUTE_PATHS.ORIGINAL_GAME);
          validationResults.value.invalidRoute = router.canNavigateTo('/invalid-route' as any);
        };

        return { router, validationResults, testValidation };
      },
      template: `
        <div data-cy="router-test">
          <button 
            @click="testValidation()"
            data-cy="validate-btn"
          >
            Test Route Validation
          </button>
          <div data-cy="valid-result">Valid: {{ validationResults.validRoute }}</div>
          <div data-cy="invalid-result">Invalid: {{ validationResults.invalidRoute }}</div>
        </div>
      `,
    });

    // Test route validation
    cy.get('[data-cy="validate-btn"]').click();
    cy.get('[data-cy="valid-result"]').should('contain', 'true');
    cy.get('[data-cy="invalid-result"]').should('contain', 'false');
  });

  it('should provide route utility methods', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        const utilityResults = ref({
          title: '',
          isCurrentRoute: false,
          availableRoutes: [] as any[],
        });

        const testUtilities = () => {
          utilityResults.value.title = router.getRouteTitle(ROUTE_PATHS.ORIGINAL_GAME);
          utilityResults.value.isCurrentRoute = router.isCurrentRoute(router.currentPath);
          utilityResults.value.availableRoutes = router.getAvailableRoutes();
        };

        return { router, utilityResults, testUtilities };
      },
      template: `
        <div data-cy="router-test">
          <button 
            @click="testUtilities()"
            data-cy="test-utilities-btn"
          >
            Test Utilities
          </button>
          <div data-cy="route-title">Title: {{ utilityResults.title }}</div>
          <div data-cy="is-current">Is Current: {{ utilityResults.isCurrentRoute }}</div>
          <div data-cy="available-count">Available: {{ utilityResults.availableRoutes.length }}</div>
        </div>
      `,
    });

    // Test utility methods
    cy.get('[data-cy="test-utilities-btn"]').click();
    cy.get('[data-cy="route-title"]').should('contain', 'Game');
    cy.get('[data-cy="is-current"]').should('contain', 'true');
    cy.get('[data-cy="available-count"]').should('not.contain', '0');
  });

  it('should handle error management', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        const errorResult = ref('none');

        const testErrorHandling = async () => {
          try {
            // Try to navigate to invalid route to trigger error
            await router.navigateTo('/totally-invalid-route' as any);
          } catch (error) {
            errorResult.value = 'caught-error';
          }

          // Check if error exists
          const lastError = router.getLastError();
          if (lastError) {
            errorResult.value = 'has-error';
          }
        };

        const clearError = () => {
          router.clearNavigationError();
          errorResult.value = 'cleared';
        };

        return { router, errorResult, testErrorHandling, clearError };
      },
      template: `
        <div data-cy="router-test">
          <button 
            @click="testErrorHandling()"
            data-cy="test-error-btn"
          >
            Test Error Handling
          </button>
          <button 
            @click="clearError()"
            data-cy="clear-error-btn"
          >
            Clear Error
          </button>
          <div data-cy="error-result">{{ errorResult }}</div>
          <div data-cy="navigation-error">{{ router.navigationError || 'none' }}</div>
        </div>
      `,
    });

    // Test error handling
    cy.get('[data-cy="test-error-btn"]').click();
    cy.get('[data-cy="error-result"]').should('not.contain', 'none');

    // Test error clearing
    cy.get('[data-cy="clear-error-btn"]').click();
    cy.get('[data-cy="error-result"]').should('contain', 'cleared');
  });

  it('should handle cleanup properly', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        const cleanupResult = ref('not-called');

        const testCleanup = () => {
          try {
            router.cleanup();
            cleanupResult.value = 'called';
          } catch (error) {
            cleanupResult.value = 'error';
          }
        };

        return { router, cleanupResult, testCleanup };
      },
      template: `
        <div data-cy="router-test">
          <button 
            @click="testCleanup()"
            data-cy="cleanup-btn"
          >
            Test Cleanup
          </button>
          <div data-cy="cleanup-result">{{ cleanupResult }}</div>
        </div>
      `,
    });

    // Test cleanup
    cy.get('[data-cy="cleanup-btn"]').click();
    cy.get('[data-cy="cleanup-result"]').should('contain', 'called');
  });

  it('should provide navigation state object', () => {
    cy.mount({
      setup() {
        const router = useRouter();
        return { router };
      },
      template: `
        <div data-cy="router-test">
          <div data-cy="nav-state-path">{{ router.navigationState.currentPath }}</div>
          <div data-cy="nav-state-mode">{{ router.navigationState.currentMode }}</div>
          <div data-cy="nav-state-navigating">{{ router.navigationState.isNavigating }}</div>
        </div>
      `,
    });

    // Verify navigation state object
    cy.get('[data-cy="nav-state-path"]').should('exist');
    cy.get('[data-cy="nav-state-mode"]').should('exist');
    cy.get('[data-cy="nav-state-navigating"]').should('contain', 'false');
  });
});
