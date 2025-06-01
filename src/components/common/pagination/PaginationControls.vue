<template>
  <Pagination
    v-bind="$props"
    class="pagination-controls"
    @update:currentPage="$emit('update:currentPage', $event)"
    @update:itemsPerPage="$emit('update:itemsPerPage', $event)"
    @pageChange="$emit('pageChange', $event, $event)"
    @itemsPerPageChange="$emit('itemsPerPageChange', $event, $event)"
  >
    <template
      #default="{
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        startItem,
        endItem,
        hasPrevious,
        hasNext,
        pages,
        canGoToFirst,
        canGoToLast,
        onFirst,
        onPrevious,
        onNext,
        onLast,
        onPage,
        onItemsPerPageChange,
        itemsPerPageOptions,
      }"
    >
      <div class="pagination-wrapper">
        <!-- Items per page selector -->
        <div v-if="showItemsPerPage" class="pagination-items-per-page">
          <label class="pagination-label">
            Show:
            <select
              :value="itemsPerPage"
              @change="onItemsPerPageChange(Number(($event.target as HTMLSelectElement).value))"
              class="pagination-select"
            >
              <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            per page
          </label>
        </div>

        <!-- Pagination info -->
        <div class="pagination-info">
          <span class="pagination-info-text">
            Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} sessions
          </span>
        </div>

        <!-- Pagination controls -->
        <div class="pagination-controls">
          <!-- First page button -->
          <button
            v-if="showFirstLast"
            @click="onFirst"
            :disabled="!canGoToFirst"
            class="pagination-button pagination-button--nav"
            :class="{ 'pagination-button--disabled': !canGoToFirst }"
            title="Go to first page"
            aria-label="Go to first page"
          >
            <svg class="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Previous page button -->
          <button
            @click="onPrevious"
            :disabled="!hasPrevious"
            class="pagination-button pagination-button--nav"
            :class="{ 'pagination-button--disabled': !hasPrevious }"
            title="Go to previous page"
            aria-label="Go to previous page"
          >
            <svg class="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Page numbers -->
          <template v-for="(page, index) in pages" :key="`page-${index}`">
            <!-- Ellipsis -->
            <span v-if="page === 'ellipsis'" class="pagination-ellipsis" aria-hidden="true">
              ...
            </span>

            <!-- Page number button -->
            <button
              v-else
              @click="onPage(page)"
              class="pagination-button pagination-button--page"
              :class="{
                'pagination-button--active': page === currentPage,
                'pagination-button--inactive': page !== currentPage,
              }"
              :aria-label="`Go to page ${page}`"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
            </button>
          </template>

          <!-- Next page button -->
          <button
            @click="onNext"
            :disabled="!hasNext"
            class="pagination-button pagination-button--nav"
            :class="{ 'pagination-button--disabled': !hasNext }"
            title="Go to next page"
            aria-label="Go to next page"
          >
            <svg class="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Last page button -->
          <button
            v-if="showFirstLast"
            @click="onLast"
            :disabled="!canGoToLast"
            class="pagination-button pagination-button--nav"
            :class="{ 'pagination-button--disabled': !canGoToLast }"
            title="Go to last page"
            aria-label="Go to last page"
          >
            <svg class="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </Pagination>
</template>

<script setup lang="ts">
import { Pagination } from '@/design-system/primitives/Pagination';
import type { PaginationProps, PaginationEmits } from '@/design-system/primitives/Pagination';

// Props (inherit from headless component)
interface Props extends PaginationProps {}

interface Emits extends PaginationEmits {}

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
</script>

<style scoped>
/* Pagination Controls using Design Tokens */
.pagination-wrapper {
  @apply flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4;
  padding: var(--spacing-4, 1rem);
  background-color: var(--color-neutral-50, #f9fafb);
  border: 1px solid var(--color-neutral-200, #e5e7eb);
  border-radius: var(--spacing-2, 0.5rem);
}

.pagination-items-per-page {
  @apply flex items-center;
}

.pagination-label {
  @apply flex items-center gap-2 text-sm font-medium;
  color: var(--color-neutral-700, #374151);
}

.pagination-select {
  @apply px-3 py-1 text-sm border rounded-md;
  background-color: var(--color-neutral-50, #f9fafb);
  border-color: var(--color-neutral-300, #d1d5db);
  color: var(--color-neutral-900, #111827);
  transition: all 0.2s ease-in-out;
  min-width: 4rem;
}

.pagination-select:focus {
  outline: none;
  border-color: var(--color-primary-500, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.pagination-info {
  @apply flex items-center;
}

.pagination-info-text {
  @apply text-sm font-medium;
  color: var(--color-neutral-600, #4b5563);
}

.pagination-controls {
  @apply flex items-center gap-1;
}

.pagination-button {
  @apply flex items-center justify-center transition-all duration-200 ease-in-out;
  min-width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-neutral-300, #d1d5db);
  border-radius: var(--spacing-1, 0.25rem);
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--color-neutral-50, #f9fafb);
  color: var(--color-neutral-700, #374151);
}

.pagination-button:hover:not(.pagination-button--disabled) {
  background-color: var(--color-neutral-100, #f3f4f6);
  border-color: var(--color-neutral-400, #9ca3af);
}

.pagination-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  border-color: var(--color-primary-500, #6366f1);
}

.pagination-button--nav {
  @apply px-2;
}

.pagination-button--page {
  @apply px-3;
}

.pagination-button--active {
  background-color: var(--color-primary-600, #4f46e5);
  border-color: var(--color-primary-600, #4f46e5);
  color: white;
}

.pagination-button--active:hover {
  background-color: var(--color-primary-700, #4338ca);
  border-color: var(--color-primary-700, #4338ca);
}

.pagination-button--inactive:hover {
  background-color: var(--color-primary-50, #eef2ff);
  border-color: var(--color-primary-300, #a5b4fc);
  color: var(--color-primary-700, #4338ca);
}

.pagination-button--disabled {
  @apply cursor-not-allowed opacity-50;
  background-color: var(--color-neutral-100, #f3f4f6);
  color: var(--color-neutral-400, #9ca3af);
}

.pagination-button--disabled:hover {
  background-color: var(--color-neutral-100, #f3f4f6);
  border-color: var(--color-neutral-300, #d1d5db);
  color: var(--color-neutral-400, #9ca3af);
}

.pagination-icon {
  @apply w-4 h-4;
}

.pagination-ellipsis {
  @apply flex items-center justify-center px-3 py-2 text-sm font-medium;
  color: var(--color-neutral-500, #6b7280);
  min-width: 2.5rem;
  height: 2.5rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .pagination-wrapper {
    @apply flex-col items-stretch;
  }

  .pagination-controls {
    @apply justify-center;
  }

  .pagination-items-per-page,
  .pagination-info {
    @apply justify-center;
  }
}
</style>
