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
    >
      <!-- Default Template Structure - Can be overridden by slot content -->
      <div class="panel-container">
        <!-- Panel Header -->
        <div class="panel-header">
          <div class="panel-title-section">
            <span class="panel-title">{{ title }}</span>
            <span v-if="subtitle" class="panel-subtitle">{{ subtitle }}</span>
          </div>

          <button
            v-if="isClosable"
            @click="handleClose"
            @keydown.enter="handleClose"
            @keydown.space.prevent="handleClose"
            class="panel-close"
            type="button"
            title="Close panel"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <!-- Panel Sections -->
        <div class="panel-sections">
          <div v-for="section in sections" :key="section.sectionId" class="panel-section">
            <h3 class="section-title">{{ section.title }}</h3>

            <div class="section-actions">
              <button
                v-for="action in section.actions"
                :key="action.actionId"
                @click="handleSectionAction(section.sectionId, action.actionId)"
                @keydown.enter="handleSectionAction(section.sectionId, action.actionId)"
                @keydown.space.prevent="handleSectionAction(section.sectionId, action.actionId)"
                :class="['section-action', action.variant || 'secondary']"
                :disabled="isSectionActionDisabled(section.sectionId, action.actionId)"
                :title="getSectionActionTitle(section.sectionId, action.actionId)"
                :aria-label="getSectionActionTitle(section.sectionId, action.actionId)"
                type="button"
              >
                <span v-if="action.icon">{{ action.icon }}</span>
                {{ getSectionActionLabel(section.sectionId, action.actionId) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </slot>
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
