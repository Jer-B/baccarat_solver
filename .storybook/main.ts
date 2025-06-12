import type { StorybookConfig } from '@storybook/vue3-vite';
import path from 'path';
import { mergeConfig } from 'vite';
import viteConfig from '../vite.config';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],

  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-viewport',
    '@storybook/addon-controls',
  ],

  framework: {
    name: '@storybook/vue3-vite',
    options: {
      // Use vue-component-meta for enhanced type extraction (Volar-powered)
      // This is the latest and most advanced docgen tool for Vue 3
      docgen: 'vue-component-meta',
    },
  },

  // Documentation configuration - using type assertion to work around TS issue
  docs: {
    autodocs: 'tag',
  } as any,

  // TypeScript configuration for optimal development experience
  typescript: {
    check: false, // Disable type checking for faster builds (use your IDE/CI for this)
    skipCompiler: false, // Enable TypeScript compilation for better performance
  },

  // Core Storybook configuration
  core: {
    disableTelemetry: true, // Disable telemetry for privacy
  },

  // Static directories for assets
  staticDirs: ['../public'],

  // Environment variables configuration
  env: config => ({
    ...config,
    // Add any custom environment variables here
  }),

  // Features configuration for Storybook 9
  features: {
    // Enable experimental features if needed
    // experimentalRSC: true, // React Server Components (if using React)
  },

  // Build optimization for production
  build: {
    test: {
      // Optimize build for testing when using --test flag
      disableSourcemaps: false, // Keep source maps for debugging
      disableTreeShaking: false, // Keep tree shaking for smaller bundles
      disableAutoDocs: false, // Keep autodocs in test builds
      disableDocgen: false, // Keep component analysis
    },
  },

  // Vite configuration customization - MERGE WITH PROJECT CONFIG
  viteFinal: async (config, { configType }) => {
    // Merge with the project's Vite configuration
    const mergedConfig = mergeConfig(config, viteConfig);

    // Additional Storybook-specific customizations
    mergedConfig.resolve = {
      ...mergedConfig.resolve,
      alias: {
        ...mergedConfig.resolve?.alias,
        '@': path.resolve(__dirname, '../src'),
        '~': path.resolve(__dirname, '../'),
      },
    };

    // Ensure proper handling of TypeScript files
    mergedConfig.esbuild = {
      ...mergedConfig.esbuild,
      target: 'es2020',
    };

    // Customize Vite config for Storybook
    if (configType === 'DEVELOPMENT') {
      // Development-specific optimizations
      mergedConfig.optimizeDeps = {
        ...mergedConfig.optimizeDeps,
        include: ['vue', 'pinia', 'zod'],
        exclude: ['@storybook/vue3-vite'],
      };
    }

    if (configType === 'PRODUCTION') {
      // Production-specific optimizations
      mergedConfig.build = {
        ...mergedConfig.build,
        rollupOptions: {
          ...mergedConfig.build?.rollupOptions,
          output: {
            manualChunks: {
              vendor: ['vue', 'pinia'],
              utils: ['zod'],
            },
          },
        },
      };
    }

    return mergedConfig;
  },
};

export default config;
