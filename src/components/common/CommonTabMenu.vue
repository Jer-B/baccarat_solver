<template>
  <TabMenu
    :tabs="tabs"
    :nav-classes="navClasses"
    :container-classes="containerClasses"
    :tab-classes="tabClasses"
    :active-tab-classes="activeTabClasses"
    aria-label="Main navigation tabs"
    @tab-click="handleTabClick"
    @tab-change="handleTabChange"
  >
    <template #tab="{ tab, isActive }">
      <span :class="{ 'font-semibold': isActive, 'font-medium': !isActive }">
        {{ tab.name }}
      </span>
    </template>
  </TabMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TabMenu from '@/design-system/primitives/TabMenu/TabMenu.vue';
import type { Tab } from '@/design-system/primitives/TabMenu/TabMenu.vue';

// Props interface
interface Props {
  tabs: Tab[];
}

// Props
defineProps<Props>();

// Emits interface
interface Emits {
  tabClick: [tab: Tab];
  tabChange: [tab: Tab];
}

const emit = defineEmits<Emits>();

// Event handlers
const handleTabClick = (tab: Tab) => {
  emit('tabClick', tab);
};

const handleTabChange = (tab: Tab) => {
  emit('tabChange', tab);
};

// Design system aware classes using CSS custom properties
const navClasses = computed(() => ['bg-white', 'shadow-sm', 'border-b', 'tab-menu-styled-nav']);

const containerClasses = computed(() => [
  'container',
  'mx-auto',
  'px-4',
  'flex',
  'justify-center',
  'space-x-2',
  'h-12',
  'tab-menu-styled-container',
]);

const tabClasses = computed(() => [
  'px-4',
  'py-3',
  'font-medium',
  'text-sm',
  'transition-all',
  'duration-200',
  'flex',
  'items-center',
  'justify-center',
  'rounded-t-lg',
  'relative',
  'no-underline',
  'text-gray-600',
  'hover:text-gray-800',
  'hover:bg-gray-100',
  'tab-menu-styled-tab',
]);

const activeTabClasses = computed(() => [
  'text-baccarat-green',
  'bg-green-50',
  'border-b-2',
  'border-baccarat-green',
  'tab-menu-styled-tab--active',
]);
</script>

<style scoped>
/* CommonTabMenu using design system tokens */
:deep(.tab-menu-styled-nav) {
  /* Use design system tokens for consistent styling */
  background-color: var(--color-neutral-50, white);
  border-bottom: 1px solid var(--color-neutral-200, #e5e7eb);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

:deep(.tab-menu-styled-container) {
  /* Container styling with design tokens */
  max-width: var(--container-max-width, 1200px);
  padding-left: var(--spacing-4, 1rem);
  padding-right: var(--spacing-4, 1rem);
  height: 3rem;
}

:deep(.tab-menu-styled-tab) {
  /* Tab styling using design tokens */
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--spacing-2, 0.5rem) var(--spacing-2, 0.5rem) 0 0;
  color: var(--color-neutral-600, #4b5563);
  text-decoration: none !important;
  transition: all 0.2s ease-in-out;
  outline: none; /* Remove default outline */
}

:deep(.tab-menu-styled-tab:hover:not(.tab-menu-styled-tab--active)) {
  color: var(--color-neutral-800, #1f2937);
  background-color: var(--color-neutral-100, #f3f4f6);
}

:deep(.tab-menu-styled-tab--active) {
  color: var(--color-semantic-success-600, #059669);
  background-color: var(--color-semantic-success-50, #ecfdf5);
  border-bottom: 2px solid var(--color-semantic-success-600, #059669);
  font-weight: 600;
  outline: none; /* Remove outline for active tabs */
}

/* Remove default link styling */
:deep(.tab-menu-styled-tab) {
  text-decoration: none !important;
}

:deep(.tab-menu-styled-tab:visited) {
  color: inherit;
}

/* Focus styles for accessibility - only show on keyboard focus */
:deep(.tab-menu-styled-tab:focus-visible) {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

/* Remove focus outline on mouse click but keep for keyboard navigation */
:deep(.tab-menu-styled-tab:focus:not(:focus-visible)) {
  outline: none;
}
</style>
