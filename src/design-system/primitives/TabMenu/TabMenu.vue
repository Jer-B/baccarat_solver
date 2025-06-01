<template>
  <nav :class="computedNavClasses" role="tablist" :aria-label="ariaLabel" v-bind="$attrs">
    <slot name="container" :tabs="tabs" :activeTab="activeTab" :isTabActive="isTabActive">
      <div :class="computedContainerClasses">
        <slot name="tabs" :tabs="tabs" :activeTab="activeTab" :isTabActive="isTabActive">
          <component
            v-for="tab in tabs"
            :key="tab.id"
            :is="linkComponent"
            :to="tab.path"
            :class="computedTabClasses(tab)"
            :aria-selected="isTabActive(tab)"
            :aria-controls="`tabpanel-${tab.id}`"
            role="tab"
          >
            <slot name="tab" :tab="tab" :isActive="isTabActive(tab)">
              {{ tab.name }}
            </slot>
          </component>
        </slot>
      </div>
    </slot>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

// Types
export interface Tab {
  id: string;
  name: string;
  path: string;
  disabled?: boolean;
}

interface Props {
  tabs: Tab[];
  ariaLabel?: string;
  linkComponent?: string;
  navClasses?: string | string[];
  containerClasses?: string | string[];
  tabClasses?: string | string[];
  activeTabClasses?: string | string[];
  disabledTabClasses?: string | string[];
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  ariaLabel: 'Navigation tabs',
  linkComponent: 'router-link',
  navClasses: '',
  containerClasses: '',
  tabClasses: '',
  activeTabClasses: '',
  disabledTabClasses: '',
});

// Emits interface
interface Emits {
  tabClick: [tab: Tab];
  tabChange: [tab: Tab];
}

const emit = defineEmits<Emits>();

// Router integration
const route = useRoute();

// Computed properties for headless logic
const activeTab = computed(() => {
  return props.tabs.find(tab => tab.path === route.path) || null;
});

const isTabActive = (tab: Tab): boolean => {
  return route.path === tab.path;
};

// Watch for route changes to emit events
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      const newTab = props.tabs.find(tab => tab.path === newPath);
      const oldTab = props.tabs.find(tab => tab.path === oldPath);

      if (newTab) {
        emit('tabClick', newTab);
        if (oldTab) {
          emit('tabChange', newTab);
        }
      }
    }
  }
);

// Style computation (headless - can be overridden)
const computedNavClasses = computed(() => {
  const baseClasses = ['tab-menu-nav'];

  if (typeof props.navClasses === 'string') {
    return [...baseClasses, props.navClasses].filter(Boolean).join(' ');
  }

  return [...baseClasses, ...props.navClasses].filter(Boolean).join(' ');
});

const computedContainerClasses = computed(() => {
  const baseClasses = ['tab-menu-container'];

  if (typeof props.containerClasses === 'string') {
    return [...baseClasses, props.containerClasses].filter(Boolean).join(' ');
  }

  return [...baseClasses, ...props.containerClasses].filter(Boolean).join(' ');
});

const computedTabClasses = (tab: Tab) => {
  const baseClasses = ['tab-menu-tab'];

  // Add state classes
  if (isTabActive(tab)) {
    baseClasses.push('tab-menu-tab--active');
  }

  if (tab.disabled) {
    baseClasses.push('tab-menu-tab--disabled');
  }

  // Add custom classes
  if (typeof props.tabClasses === 'string') {
    baseClasses.push(props.tabClasses);
  } else {
    baseClasses.push(...props.tabClasses);
  }

  // Add active state classes
  if (isTabActive(tab)) {
    if (typeof props.activeTabClasses === 'string') {
      baseClasses.push(props.activeTabClasses);
    } else {
      baseClasses.push(...props.activeTabClasses);
    }
  }

  // Add disabled state classes
  if (tab.disabled) {
    if (typeof props.disabledTabClasses === 'string') {
      baseClasses.push(props.disabledTabClasses);
    } else {
      baseClasses.push(...props.disabledTabClasses);
    }
  }

  return baseClasses.filter(Boolean).join(' ');
};
</script>

<style scoped>
/* Base headless styles - minimal styling for functionality */
.tab-menu-nav {
  /* Minimal base styles for accessibility */
  position: relative;
}

.tab-menu-container {
  /* Minimal container styles */
  display: flex;
}

.tab-menu-tab {
  /* Minimal tab styles for functionality */
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.tab-menu-tab--disabled {
  cursor: not-allowed;
  pointer-events: none;
}

/* Focus styles for accessibility */
.tab-menu-tab:focus {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}
</style>
