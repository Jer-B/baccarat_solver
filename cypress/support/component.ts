/**
 * Cypress Component Testing Support
 *
 * This file is processed and loaded automatically before component test files.
 *
 * Configuration for testing Vue components in isolation.
 */

import './commands';
import { mount } from 'cypress/vue';

// Code coverage support for component testing
import '@cypress/code-coverage/support';

// Augment the Cypress namespace to include type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

// Example of how to use Vue Router with component testing
import { createRouter, createMemoryHistory } from 'vue-router';
import type { Router } from 'vue-router';

// Helper to create router for component testing
Cypress.Commands.add('mountWithRouter', (component: any, options: any = {}) => {
  const router: Router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes || [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/test', component: { template: '<div>Test</div>' } },
    ],
  });

  return cy.mount(component, {
    global: {
      plugins: [router],
      ...options.global,
    },
    ...options,
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      mountWithRouter(component: any, options?: any): Chainable<any>;
    }
  }
}
