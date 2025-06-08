<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="handleClick"
    class="cdd-focus-ring"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'base' | 'lg' | 'xl';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'base',
  type: 'button',
  disabled: false,
});

const emit = defineEmits<Emits>();

const buttonClasses = computed(() => {
  const baseClasses = ['cdd-btn'];

  // Variant classes
  switch (props.variant) {
    case 'primary':
      baseClasses.push('cdd-btn-primary');
      break;
    case 'secondary':
      baseClasses.push('cdd-btn-secondary');
      break;
    case 'success':
      baseClasses.push('cdd-btn-success');
      break;
    case 'danger':
      baseClasses.push('cdd-btn-danger');
      break;
    case 'warning':
      baseClasses.push('cdd-btn-warning');
      break;
    case 'ghost':
      baseClasses.push('cdd-btn-ghost');
      break;
  }

  // Size classes
  if (props.size !== 'base') {
    baseClasses.push(`cdd-btn-${props.size}`);
  }

  return baseClasses.join(' ');
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>
