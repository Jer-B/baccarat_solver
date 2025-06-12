/**
 * Unit Tests for CDDCommonGameHeader Component
 *
 * Tests component rendering, theme integration, connection health states,
 * responsive behavior, and accessibility features.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { ref, computed } from 'vue';
import CDDCommonGameHeader from '../../../../src/components/common/CDDCommonGameHeader.vue';

// Mock the composables
vi.mock('../../../../src/composables/useSupabaseConnectionHealth', () => ({
  useSupabaseConnectionHealth: vi.fn(),
}));

vi.mock('../../../../src/stores/themeStore', () => ({
  useThemeStore: vi.fn(),
}));

// Import after mocking
import { useSupabaseConnectionHealth } from '../../../../src/composables/useSupabaseConnectionHealth';
import { useThemeStore } from '../../../../src/stores/themeStore';

describe('CDDCommonGameHeader', () => {
  let wrapper: VueWrapper;
  let mockHealthState: any;
  let mockThemeState: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock connection health state
    mockHealthState = {
      isHealthy: ref(true),
      isChecking: ref(false),
      connectionStatus: ref('healthy'),
    };

    // Mock theme store state
    mockThemeState = {
      isLuxuryTheme: computed(() => true),
      isEliteTheme: computed(() => false),
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    };

    // Setup mocks
    vi.mocked(useSupabaseConnectionHealth).mockReturnValue(mockHealthState);
    vi.mocked(useThemeStore).mockReturnValue(mockThemeState);
  });

  const createWrapper = (props = {}) => {
    return mount(CDDCommonGameHeader, {
      props,
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
        stubs: {
          CDDThemeToggle: true,
        },
      },
    });
  };

  describe('Component Rendering', () => {
    it('renders the header element with correct data-cy attribute', () => {
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.exists()).toBe(true);
      expect(header.element.tagName).toBe('HEADER');
    });

    it('renders the title correctly', () => {
      wrapper = createWrapper();

      const title = wrapper.find('.cdd-header__title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('🎯 Baccarat Pro');
      expect(title.element.tagName).toBe('H1');
    });

    it('renders the theme toggle component', () => {
      wrapper = createWrapper();

      const themeToggle = wrapper.findComponent({ name: 'CDDThemeToggle' });
      expect(themeToggle.exists()).toBe(true);
    });

    it('renders the health indicator dot', () => {
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.exists()).toBe(true);

      const healthIndicator = wrapper.find('.cdd-header__health-indicator');
      expect(healthIndicator.exists()).toBe(true);

      const healthCircle = wrapper.find('.cdd-header__health-circle');
      expect(healthCircle.exists()).toBe(true);
    });
  });

  describe('Theme Integration', () => {
    it('applies luxury theme class when isLuxuryTheme is true', () => {
      mockThemeState.isLuxuryTheme = computed(() => true);
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--luxury');
      expect(header.classes()).not.toContain('cdd-header--elite');
    });

    it('applies elite theme class when isLuxuryTheme is false', () => {
      mockThemeState.isLuxuryTheme = computed(() => false);
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
      expect(header.classes()).not.toContain('cdd-header--luxury');
    });

    it('updates theme class reactively when theme changes', async () => {
      wrapper = createWrapper();

      // Initially luxury
      let header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--luxury');

      // Change to elite
      mockThemeState.isLuxuryTheme = computed(() => false);
      await wrapper.vm.$nextTick();

      header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
    });
  });

  describe('Connection Health States', () => {
    it('shows healthy state when connection is healthy', () => {
      mockHealthState.isHealthy.value = true;
      mockHealthState.isChecking.value = false;
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.classes()).toContain('cdd-header__health-dot--healthy');
      expect(healthDot.classes()).not.toContain('cdd-header__health-dot--checking');
      expect(healthDot.classes()).not.toContain('cdd-header__health-dot--error');
    });

    it('shows checking state when connection is being checked', () => {
      mockHealthState.isHealthy.value = true;
      mockHealthState.isChecking.value = true;
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.classes()).toContain('cdd-header__health-dot--checking');
      expect(healthDot.classes()).not.toContain('cdd-header__health-dot--healthy');
      expect(healthDot.classes()).not.toContain('cdd-header__health-dot--error');
    });

    it('shows error state when connection is unhealthy', () => {
      mockHealthState.isHealthy.value = false;
      mockHealthState.isChecking.value = false;
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.classes()).toContain('cdd-header__health-dot--error');
      expect(healthDot.classes()).not.toContain('cdd-header__health-dot--healthy');
      expect(healthDot.classes()).not.toContain('cdd-header__health-dot--checking');
    });

    it('shows pulse animation when checking', () => {
      mockHealthState.isChecking.value = true;
      wrapper = createWrapper();

      const pulse = wrapper.find('.cdd-header__health-pulse');
      expect(pulse.exists()).toBe(true);
    });

    it('hides pulse animation when not checking', () => {
      mockHealthState.isChecking.value = false;
      wrapper = createWrapper();

      const pulse = wrapper.find('.cdd-header__health-pulse');
      expect(pulse.exists()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label for health indicator', () => {
      mockHealthState.connectionStatus.value = 'healthy';
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.attributes('aria-label')).toBe('Database status: healthy');
    });

    it('updates ARIA label based on connection status', async () => {
      wrapper = createWrapper();

      // Test different connection statuses
      const testCases = [
        { status: 'healthy', expected: 'Database status: healthy' },
        { status: 'checking', expected: 'Database status: checking' },
        { status: 'error', expected: 'Database status: error' },
      ];

      for (const testCase of testCases) {
        mockHealthState.connectionStatus.value = testCase.status;
        await wrapper.vm.$nextTick();

        const healthDot = wrapper.find('.cdd-header__health-dot');
        expect(healthDot.attributes('aria-label')).toBe(testCase.expected);
      }
    });

    it('has semantic HTML structure', () => {
      wrapper = createWrapper();

      // Check header element
      const header = wrapper.find('header');
      expect(header.exists()).toBe(true);

      // Check h1 title
      const title = wrapper.find('h1');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('🎯 Baccarat Pro');

      // Check nav element for theme toggle
      const nav = wrapper.find('nav');
      expect(nav.exists()).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('has proper CSS classes for responsive design', () => {
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header');

      // Check responsive classes
      const title = wrapper.find('.cdd-header__title');
      expect(title.classes()).toContain('cdd-header__title');

      const healthIndicator = wrapper.find('.cdd-header__health-indicator');
      expect(healthIndicator.classes()).toContain('cdd-header__health-indicator');
    });

    it('has proper structure for responsive layout', () => {
      wrapper = createWrapper();

      // Check main container
      const container = wrapper.find('.cdd-header__container');
      expect(container.exists()).toBe(true);

      // Check left section
      const leftSection = wrapper.find('.cdd-header__left');
      expect(leftSection.exists()).toBe(true);

      // Check right section
      const rightSection = wrapper.find('.cdd-header__right');
      expect(rightSection.exists()).toBe(true);
    });
  });

  describe('Component Integration', () => {
    it('integrates with theme store correctly', () => {
      wrapper = createWrapper();

      // Verify theme store is called
      expect(useThemeStore).toHaveBeenCalled();
    });

    it('integrates with connection health composable correctly', () => {
      wrapper = createWrapper();

      // Verify connection health composable is called
      expect(useSupabaseConnectionHealth).toHaveBeenCalled();
    });

    it('passes theme toggle component correctly', () => {
      wrapper = createWrapper();

      const themeToggle = wrapper.findComponent({ name: 'CDDThemeToggle' });
      expect(themeToggle.exists()).toBe(true);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies base CSS classes correctly', () => {
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header');
    });

    it('applies luxury theme-specific classes', () => {
      mockThemeState.isLuxuryTheme = computed(() => true);
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--luxury');
    });

    it('applies elite theme-specific classes', () => {
      mockThemeState.isLuxuryTheme = computed(() => false);
      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
    });
  });

  describe('Error Handling', () => {
    it('handles missing theme store gracefully', () => {
      vi.mocked(useThemeStore).mockReturnValue(null as any);

      expect(() => {
        wrapper = createWrapper();
      }).not.toThrow();
    });

    it('handles missing connection health gracefully', () => {
      vi.mocked(useSupabaseConnectionHealth).mockReturnValue(null as any);

      expect(() => {
        wrapper = createWrapper();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      wrapper = createWrapper();

      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');

      // Trigger some state changes
      mockHealthState.isHealthy.value = false;
      mockHealthState.isHealthy.value = true;

      // Should not force unnecessary updates
      expect(renderSpy).not.toHaveBeenCalled();
    });
  });
});
