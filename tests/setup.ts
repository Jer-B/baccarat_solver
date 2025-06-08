/**
 * Test Setup: Global test environment configuration
 *
 * Setup Summary:
 * - Vue Test Utils global configuration for theme components
 * - Pinia testing setup with createTestingPinia for proper store isolation
 * - JSDOM environment enhancement for browser APIs
 * - Global mocks for localStorage and document APIs
 * - Proper cleanup and test isolation
 */

import { beforeEach, vi } from 'vitest';
import { config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

// Configure Vue Test Utils globally with proper Pinia testing setup
config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: false, // Allow real actions for theme persistence testing
  }),
];

// Mock browser APIs globally
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(global, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock document for theme DOM manipulation
  Object.defineProperty(global, 'document', {
    value: {
      documentElement: {
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        style: {
          setProperty: vi.fn(),
        },
      },
      readyState: 'complete',
    },
    writable: true,
  });

  // Mock window for storage events
  Object.defineProperty(global, 'window', {
    value: {
      localStorage: localStorageMock,
      sessionStorage: localStorageMock,
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    writable: true,
  });

  // Mock performance API
  Object.defineProperty(global, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
    },
    writable: true,
  });
});

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => Promise.resolve({ data: [], error: null })),
      delete: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
}));

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
  })),
}));

// Mock VueUse
vi.mock('@vueuse/core', () => ({
  useLocalStorage: vi.fn(),
  useSessionStorage: vi.fn(),
  useMouse: vi.fn(),
  useWindowSize: vi.fn(),
}));
