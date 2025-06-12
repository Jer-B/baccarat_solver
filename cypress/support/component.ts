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

// Image snapshot support for visual regression testing
import 'cypress-image-snapshot/command';

// Enhanced Cypress plugins
import '@cypress/grep';
import 'cypress-real-events/support';
import 'cypress-axe';

// Augment the Cypress namespace to include type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      matchImageSnapshot(name?: string): Chainable<Element>;
      matchImageSnapshot(options: any): Chainable<Element>;
      matchImageSnapshot(name: string, options: any): Chainable<Element>;

      // Real events plugin
      realClick(options?: any): Chainable<Element>;
      realHover(options?: any): Chainable<Element>;
      realPress(key: string, options?: any): Chainable<Element>;
      realType(text: string, options?: any): Chainable<Element>;
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
