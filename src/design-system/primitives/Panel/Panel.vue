<template>
  <component :is="as" :class="computedClass" :role="role" :aria-label="computedAriaLabel">
    <slot
      :title="title"
      :subtitle="subtitle"
      :sections="sections"
      :isClosable="isClosable"
      :onClose="handleClose"
      :onSectionAction="handleSectionAction"
      :isSectionActionDisabled="isSectionActionDisabled"
      :getSectionActionLabel="getSectionActionLabel"
      :getSectionActionTitle="getSectionActionTitle"
    />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Types
interface PanelAction {
  actionId: string;
  label: string;
  title?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  icon?: string;
}

interface PanelSection {
  sectionId: string;
  title: string;
  actions: PanelAction[];
}

interface Props {
  as?: string;
  title: string;
  subtitle?: string;
  sections?: PanelSection[];
  isClosable?: boolean;
  class?: string;
  role?: string;
  ariaLabel?: string;
}

interface Emits {
  close: [];
  sectionAction: [sectionId: string, actionId: string, action: PanelAction];
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  subtitle: '',
  sections: () => [],
  isClosable: true,
  class: '',
  role: 'region',
  ariaLabel: '',
});

// Emits
const emit = defineEmits<Emits>();

// Computed properties
const computedClass = computed(() => props.class);

const computedAriaLabel = computed(() => {
  return props.ariaLabel || `${props.title} panel`;
});

// Action helpers
const isSectionActionDisabled = (sectionId: string, actionId: string): boolean => {
  const section = props.sections.find(s => s.sectionId === sectionId);
  const action = section?.actions.find(a => a.actionId === actionId);
  return action?.disabled ?? false;
};

const getSectionActionLabel = (sectionId: string, actionId: string): string => {
  const section = props.sections.find(s => s.sectionId === sectionId);
  const action = section?.actions.find(a => a.actionId === actionId);
  return action?.label ?? '';
};

const getSectionActionTitle = (sectionId: string, actionId: string): string => {
  const section = props.sections.find(s => s.sectionId === sectionId);
  const action = section?.actions.find(a => a.actionId === actionId);
  return action?.title ?? action?.label ?? '';
};

// Event handlers
const handleClose = (): void => {
  console.log('[user-interface][user-action] Panel close requested');
  emit('close');
};

const handleSectionAction = (sectionId: string, actionId: string): void => {
  const section = props.sections.find(s => s.sectionId === sectionId);
  const action = section?.actions.find(a => a.actionId === actionId);

  if (action && !action.disabled) {
    console.log(`[user-interface][user-action] Panel section action: ${sectionId}.${actionId}`);
    emit('sectionAction', sectionId, actionId, action);
  }
};
</script>
