/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Visual regression testing with image snapshots
       */
      matchImageSnapshot(name?: string): Chainable<Element>;
      matchImageSnapshot(options: any): Chainable<Element>;
      matchImageSnapshot(name: string, options: any): Chainable<Element>;
    }
  }
}

export {};
