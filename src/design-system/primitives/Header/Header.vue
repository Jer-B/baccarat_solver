<template>
  <component :is="as" :class="computedClass" :role="role" :aria-label="computedAriaLabel">
    <slot
      :title="title"
      :actions="actions"
      :onActionClick="handleActionClick"
      :isActionActive="isActionActive"
      :getActionLabel="getActionLabel"
      :getActionTitle="getActionTitle"
    />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Types
interface HeaderAction {
  id: string;
  label: string;
  activeLabel?: string;
  title?: string;
  activeTitle?: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
  isActive?: boolean;
}

interface Props {
  as?: string;
  title: string;
  actions?: HeaderAction[];
  class?: string;
  role?: string;
  ariaLabel?: string;
}

interface Emits {
  actionClick: [actionId: string, action: HeaderAction];
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  as: 'header',
  actions: () => [],
  class: '',
  role: 'banner',
  ariaLabel: '',
});

// Emits
const emit = defineEmits<Emits>();

// Computed properties
const computedClass = computed(() => props.class);

const computedAriaLabel = computed(() => {
  return props.ariaLabel || `${props.title} header`;
});

// Action helpers
const isActionActive = (actionId: string): boolean => {
  const action = props.actions.find(a => a.id === actionId);
  return action?.isActive ?? false;
};

const getActionLabel = (actionId: string): string => {
  const action = props.actions.find(a => a.id === actionId);
  if (!action) {return '';}

  return action.isActive && action.activeLabel ? action.activeLabel : action.label;
};

const getActionTitle = (actionId: string): string => {
  const action = props.actions.find(a => a.id === actionId);
  if (!action) {return '';}

  return action.isActive && action.activeTitle ? action.activeTitle : action.title || action.label;
};

// Event handlers
const handleActionClick = (actionId: string): void => {
  const action = props.actions.find(a => a.id === actionId);
  if (action) {
    console.log(`[user-interface][user-action] Header action clicked: ${actionId}`);
    emit('actionClick', actionId, action);
  }
};
</script>
