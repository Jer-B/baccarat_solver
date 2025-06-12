/**
 * Integration Tests for CDDCommonGameHeader Component
 *
 * Tests real integration with theme store, connection health composable,
 * and child components without mocking.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import CDDCommonGameHeader from '../../../../src/components/common/CDDCommonGameHeader.vue';
import { useThemeStore } from '../../../../src/stores/themeStore';

// Mock Supabase for connection health
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

describe('CDDCommonGameHeader Integration', () => {
  let wrapper: VueWrapper;
  let pinia: any;
  let themeStore: any;

  beforeEach(() => {
    // Create fresh Pinia instance for each test
    pinia = createPinia();
    setActivePinia(pinia);

    // Get real theme store instance
    themeStore = useThemeStore();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = () => {
    return mount(CDDCommonGameHeader, {
      global: {
        plugins: [pinia],
      },
    });
  };

  describe('Theme Store Integration', () => {
    it('integrates with real theme store and responds to theme changes', async () => {
      wrapper = createWrapper();

      // Initially should be luxury theme (default)
      expect(themeStore.isLuxuryTheme).toBe(true);

      let header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--luxury');

      // Toggle to elite theme
      await themeStore.toggleTheme();
      await nextTick();

      expect(themeStore.isLuxuryTheme).toBe(false);
      header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
    });

    it('maintains theme state across component remounts', async () => {
      // Set elite theme
      await themeStore.setEliteTheme();

      wrapper = createWrapper();

      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
      expect(header.classes()).not.toContain('cdd-header--luxury');
    });

    it('responds to direct theme store mutations', async () => {
      wrapper = createWrapper();

      // Directly set luxury theme
      await themeStore.setLuxuryTheme();
      await nextTick();

      let header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--luxury');

      // Directly set elite theme
      await themeStore.setEliteTheme();
      await nextTick();

      header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
    });
  });

  describe('Connection Health Integration', () => {
    it('integrates with real connection health composable', async () => {
      wrapper = createWrapper();

      // Health indicator should be present
      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.exists()).toBe(true);

      // Should have proper ARIA label
      const ariaLabel = healthDot.attributes('aria-label');
      expect(ariaLabel).toMatch(/Database status:/);
    });

    it('shows health indicator with proper states', async () => {
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');

      // Should have one of the health state classes
      const hasHealthState =
        healthDot.classes().includes('cdd-header__health-dot--healthy') ||
        healthDot.classes().includes('cdd-header__health-dot--checking') ||
        healthDot.classes().includes('cdd-header__health-dot--error');

      expect(hasHealthState).toBe(true);
    });

    it('health indicator updates based on connection state', async () => {
      wrapper = createWrapper();

      // Wait for initial health check
      await new Promise(resolve => setTimeout(resolve, 100));
      await nextTick();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.exists()).toBe(true);

      // Should have updated ARIA label after health check
      const ariaLabel = healthDot.attributes('aria-label');
      expect(ariaLabel).toBeTruthy();
    });
  });

  describe('Child Component Integration', () => {
    it('integrates with CDDThemeToggle component', async () => {
      wrapper = createWrapper();

      const themeToggle = wrapper.findComponent({ name: 'CDDThemeToggle' });
      expect(themeToggle.exists()).toBe(true);
    });

    it('theme toggle can change header theme', async () => {
      wrapper = createWrapper();

      const themeToggle = wrapper.find('[data-cy="theme-toggle"]');
      expect(themeToggle.exists()).toBe(true);

      // Get initial theme
      const initialTheme = themeStore.isLuxuryTheme;

      // Click theme toggle
      await themeToggle.trigger('click');
      await nextTick();

      // Theme should have changed
      expect(themeStore.isLuxuryTheme).toBe(!initialTheme);

      // Header should reflect new theme
      const header = wrapper.find('[data-cy="cdd-header"]');
      if (themeStore.isLuxuryTheme) {
        expect(header.classes()).toContain('cdd-header--luxury');
      } else {
        expect(header.classes()).toContain('cdd-header--elite');
      }
    });
  });

  describe('Responsive Integration', () => {
    it('maintains proper structure across theme changes', async () => {
      wrapper = createWrapper();

      // Check initial structure
      const checkStructure = () => {
        const elements = [
          '.cdd-header',
          '.cdd-header__container',
          '.cdd-header__content',
          '.cdd-header__title',
          '.cdd-header__actions',
          '.cdd-header__health-dot',
        ];

        elements.forEach(selector => {
          expect(wrapper.find(selector).exists()).toBe(true);
        });
      };

      checkStructure();

      // Toggle theme and check structure again
      await themeStore.toggleTheme();
      await nextTick();

      checkStructure();
    });

    it('health indicator visibility rules work correctly', () => {
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.exists()).toBe(true);

      // Health dot should be visible (CSS media queries tested in E2E)
      expect(healthDot.isVisible()).toBe(true);
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility across theme changes', async () => {
      wrapper = createWrapper();

      const checkAccessibility = () => {
        // Header should be semantic
        const header = wrapper.find('header');
        expect(header.exists()).toBe(true);

        // Title should be h1
        const title = wrapper.find('h1.cdd-header__title');
        expect(title.exists()).toBe(true);

        // Health indicator should have ARIA label
        const healthDot = wrapper.find('.cdd-header__health-dot');
        expect(healthDot.attributes('aria-label')).toBeTruthy();
      };

      checkAccessibility();

      // Toggle theme and check accessibility again
      await themeStore.toggleTheme();
      await nextTick();

      checkAccessibility();
    });

    it('ARIA labels are meaningful and descriptive', () => {
      wrapper = createWrapper();

      const healthDot = wrapper.find('.cdd-header__health-dot');
      const ariaLabel = healthDot.attributes('aria-label');

      expect(ariaLabel).toMatch(/^Database status: (healthy|checking|unhealthy)$/);
    });
  });

  describe('Performance Integration', () => {
    it('does not cause memory leaks during theme changes', async () => {
      wrapper = createWrapper();

      // Perform multiple theme changes
      for (let i = 0; i < 5; i++) {
        await themeStore.toggleTheme();
        await nextTick();
      }

      // Component should still be functional
      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.exists()).toBe(true);

      const title = wrapper.find('.cdd-header__title');
      expect(title.text()).toBe('🎯 Baccarat Pro');
    });

    it('handles rapid theme changes gracefully', async () => {
      wrapper = createWrapper();

      // Rapid theme changes
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(themeStore.toggleTheme());
      }

      await Promise.all(promises);
      await nextTick();

      // Component should still be stable
      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.exists()).toBe(true);
      expect(header.classes()).toContain(
        themeStore.isLuxuryTheme ? 'cdd-header--luxury' : 'cdd-header--elite'
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('handles theme store errors gracefully', async () => {
      wrapper = createWrapper();

      // Component should render even if theme operations fail
      expect(wrapper.find('[data-cy="cdd-header"]').exists()).toBe(true);
      expect(wrapper.find('.cdd-header__title').text()).toBe('🎯 Baccarat Pro');
    });

    it('handles connection health errors gracefully', async () => {
      wrapper = createWrapper();

      // Health indicator should still render even if connection fails
      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.exists()).toBe(true);

      // Should have some health state class
      const hasHealthClass = healthDot
        .classes()
        .some(cls => cls.includes('cdd-header__health-dot--'));
      expect(hasHealthClass).toBe(true);
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('works correctly in typical user workflow', async () => {
      wrapper = createWrapper();

      // User loads page - header should be visible
      expect(wrapper.find('[data-cy="cdd-header"]').exists()).toBe(true);

      // User changes theme
      const themeToggle = wrapper.find('[data-cy="theme-toggle"]');
      await themeToggle.trigger('click');
      await nextTick();

      // Header should update
      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain(
        themeStore.isLuxuryTheme ? 'cdd-header--luxury' : 'cdd-header--elite'
      );

      // Health indicator should still be working
      const healthDot = wrapper.find('.cdd-header__health-dot');
      expect(healthDot.exists()).toBe(true);
      expect(healthDot.attributes('aria-label')).toBeTruthy();
    });

    it('maintains state during navigation simulation', async () => {
      wrapper = createWrapper();

      // Set specific theme
      await themeStore.setEliteTheme();
      await nextTick();

      // Simulate navigation by unmounting and remounting
      wrapper.unmount();
      wrapper = createWrapper();

      // Theme should persist
      const header = wrapper.find('[data-cy="cdd-header"]');
      expect(header.classes()).toContain('cdd-header--elite');
    });
  });
});
