import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    // Use environment variable or fall back to 5173, then 5174
    baseUrl:
      process.env.CYPRESS_BASE_URL || process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Enable Safari/WebKit support (for Safari testing)
    experimentalWebKitSupport: true,
    setupNodeEvents(on, config) {
      // Code coverage plugin (dynamic import for ES modules)
      import('@cypress/code-coverage/task')
        .then(task => {
          task.default(on, config);
        })
        .catch(error => {
          console.log('Code coverage plugin not available:', error.message);
        });

      // Image snapshot plugin
      import('cypress-image-snapshot/plugin')
        .then(plugin => {
          plugin.addMatchImageSnapshotPlugin(on, config);
        })
        .catch(error => {
          console.log('Image snapshot plugin not available:', error.message);
        });

      // Browser optimizations (works for Chrome, Edge, Brave, Safari)
      on('before:browser:launch', (browser, launchOptions) => {
        // Optimizations for Chromium-based browsers (Chrome, Edge, Brave)
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          return launchOptions;
        }

        // Safari-specific optimizations (if needed)
        if (browser.family === 'webkit') {
          // Safari doesn't need special args usually
          return launchOptions;
        }

        return launchOptions;
      });

      return config;
    },
  },

  component: {
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Code coverage plugin for component testing (dynamic import)
      import('@cypress/code-coverage/task')
        .then(task => {
          task.default(on, config);
        })
        .catch(error => {
          console.log('Code coverage plugin not available for component testing:', error.message);
        });

      // Image snapshot plugin for component testing
      import('cypress-image-snapshot/plugin')
        .then(plugin => {
          plugin.addMatchImageSnapshotPlugin(on, config);
        })
        .catch(error => {
          console.log('Image snapshot plugin not available for component testing:', error.message);
        });

      // Same browser optimizations for component testing
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          return launchOptions;
        }

        if (browser.family === 'webkit') {
          return launchOptions;
        }

        return launchOptions;
      });

      return config;
    },
  },

  // Global Cypress configuration
  retries: {
    runMode: 2,
    openMode: 0,
  },

  env: {
    // Environment variables for tests
    VITE_APP_TITLE: 'Baccarat Pro - Testing',
    // Code coverage configuration
    codeCoverage: {
      url: 'http://localhost:5173/__coverage__',
    },
  },

  // Note: Cypress auto-detects browsers (Chrome, Edge, Firefox, Safari, Brave)
  // No manual browser configuration needed - they'll appear automatically if installed
});
