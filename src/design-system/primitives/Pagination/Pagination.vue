<!-- Headless Pagination Primitive -->
<template>
  <component :is="as" v-if="shouldShow" :class="computedClass" :role="role" :aria-label="ariaLabel">
    <slot
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
      :itemsPerPage="itemsPerPage"
      :startItem="startItem"
      :endItem="endItem"
      :hasPrevious="hasPrevious"
      :hasNext="hasNext"
      :pages="visiblePages"
      :canGoToFirst="canGoToFirst"
      :canGoToLast="canGoToLast"
      :onFirst="handleFirst"
      :onPrevious="handlePrevious"
      :onNext="handleNext"
      :onLast="handleLast"
      :onPage="handlePage"
      :onItemsPerPageChange="handleItemsPerPageChange"
      :itemsPerPageOptions="itemsPerPageOptions"
    />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Types
interface Props {
  as?: string;
  class?: string;
  role?: string;
  ariaLabel?: string;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  maxVisiblePages?: number;
  itemsPerPageOptions?: number[];
  showFirstLast?: boolean;
  showItemsPerPage?: boolean;
}

interface Emits {
  'update:currentPage': [page: number];
  'update:itemsPerPage': [itemsPerPage: number];
  pageChange: [page: number, previousPage: number];
  itemsPerPageChange: [itemsPerPage: number, previousItemsPerPage: number];
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  as: 'nav',
  class: '',
  role: 'navigation',
  ariaLabel: 'Pagination navigation',
  maxVisiblePages: 7,
  itemsPerPageOptions: () => [10, 25, 50, 100],
  showFirstLast: true,
  showItemsPerPage: true,
});

// Emits
const emit = defineEmits<Emits>();

// Computed properties
const computedClass = computed(() => props.class);

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const shouldShow = computed(() => props.totalItems > 0);

const startItem = computed(() => {
  if (props.totalItems === 0) {
    return 0;
  }
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return Math.min(end, props.totalItems);
});

const hasPrevious = computed(() => props.currentPage > 1);

const hasNext = computed(() => props.currentPage < totalPages.value);

const canGoToFirst = computed(() => props.currentPage > 1);

const canGoToLast = computed(() => props.currentPage < totalPages.value);

// Calculate visible page numbers with ellipsis logic
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = props.currentPage;
  const maxVisible = props.maxVisiblePages;

  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  if (current <= halfVisible + 1) {
    // Current page is near the beginning
    for (let i = 2; i <= Math.min(maxVisible - 1, total - 1); i++) {
      pages.push(i);
    }
    if (total > maxVisible - 1) {
      pages.push('ellipsis');
    }
  } else if (current >= total - halfVisible) {
    // Current page is near the end
    if (total > maxVisible - 1) {
      pages.push('ellipsis');
    }
    for (let i = Math.max(total - maxVisible + 2, 2); i <= total - 1; i++) {
      pages.push(i);
    }
  } else {
    // Current page is in the middle
    pages.push('ellipsis');
    for (let i = current - halfVisible + 1; i <= current + halfVisible - 1; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
  }

  // Always show last page (if more than 1 page)
  if (total > 1) {
    pages.push(total);
  }

  return pages;
});

// Event handlers
const handleFirst = () => {
  if (canGoToFirst.value) {
    const previousPage = props.currentPage;
    emit('update:currentPage', 1);
    emit('pageChange', 1, previousPage);

    console.log('[pagination][navigation] First page clicked', {
      previousPage,
      newPage: 1,
      totalPages: totalPages.value,
    });
  }
};

const handlePrevious = () => {
  if (hasPrevious.value) {
    const previousPage = props.currentPage;
    const newPage = previousPage - 1;
    emit('update:currentPage', newPage);
    emit('pageChange', newPage, previousPage);

    console.log('[pagination][navigation] Previous page clicked', {
      previousPage,
      newPage,
      totalPages: totalPages.value,
    });
  }
};

const handleNext = () => {
  if (hasNext.value) {
    const previousPage = props.currentPage;
    const newPage = previousPage + 1;
    emit('update:currentPage', newPage);
    emit('pageChange', newPage, previousPage);

    console.log('[pagination][navigation] Next page clicked', {
      previousPage,
      newPage,
      totalPages: totalPages.value,
    });
  }
};

const handleLast = () => {
  if (canGoToLast.value) {
    const previousPage = props.currentPage;
    const newPage = totalPages.value;
    emit('update:currentPage', newPage);
    emit('pageChange', newPage, previousPage);

    console.log('[pagination][navigation] Last page clicked', {
      previousPage,
      newPage,
      totalPages: totalPages.value,
    });
  }
};

const handlePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    const previousPage = props.currentPage;
    emit('update:currentPage', page);
    emit('pageChange', page, previousPage);

    console.log('[pagination][navigation] Page number clicked', {
      previousPage,
      newPage: page,
      totalPages: totalPages.value,
    });
  }
};

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  if (newItemsPerPage !== props.itemsPerPage) {
    const previousItemsPerPage = props.itemsPerPage;

    // Calculate what the new current page should be to show similar items
    const currentFirstItem = startItem.value;
    const newPage = Math.ceil(currentFirstItem / newItemsPerPage);

    emit('update:itemsPerPage', newItemsPerPage);
    emit('update:currentPage', newPage);
    emit('itemsPerPageChange', newItemsPerPage, previousItemsPerPage);

    console.log('[pagination][configuration] Items per page changed', {
      previousItemsPerPage,
      newItemsPerPage,
      previousPage: props.currentPage,
      newPage,
      currentFirstItem,
    });
  }
};
</script>

<style scoped>
/* No styles - this is a headless component */
</style>
