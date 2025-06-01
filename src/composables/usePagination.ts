import { ref, computed, watch, readonly, type Ref, type ComputedRef } from 'vue';

export interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  persistKey?: string; // Key for localStorage persistence
}

export function usePagination<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: UsePaginationOptions = {}
) {
  const {
    initialPage = 1,
    initialItemsPerPage = 10,
    itemsPerPageOptions = [10, 25, 50, 100],
    persistKey,
  } = options;

  // Load persisted state if available
  const loadPersistedState = () => {
    if (!persistKey) {
      return { page: initialPage, itemsPerPage: initialItemsPerPage };
    }

    try {
      const saved = localStorage.getItem(`pagination-${persistKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          page: parsed.currentPage || initialPage,
          itemsPerPage: parsed.itemsPerPage || initialItemsPerPage,
        };
      }
    } catch (error) {
      console.warn('[pagination][persistence] Failed to load persisted state', { error });
    }

    return { page: initialPage, itemsPerPage: initialItemsPerPage };
  };

  const persistedState = loadPersistedState();

  // Reactive state
  const currentPage = ref(persistedState.page);
  const itemsPerPage = ref(persistedState.itemsPerPage);

  // Save state to localStorage
  const saveState = () => {
    if (!persistKey) {
      return;
    }

    try {
      const state = {
        currentPage: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        timestamp: Date.now(),
      };
      localStorage.setItem(`pagination-${persistKey}`, JSON.stringify(state));

      console.log('[pagination][persistence] State saved', {
        persistKey,
        currentPage: currentPage.value,
        itemsPerPage: itemsPerPage.value,
      });
    } catch (error) {
      console.warn('[pagination][persistence] Failed to save state', { error });
    }
  };

  // Computed properties
  const totalItems = computed(() => items.value.length);

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);

  const endIndex = computed(() =>
    Math.min(startIndex.value + itemsPerPage.value, totalItems.value)
  );

  const paginatedItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value);
  });

  const startItem = computed(() => {
    if (totalItems.value === 0) {
      return 0;
    }
    return startIndex.value + 1;
  });

  const endItem = computed(() => endIndex.value);

  const hasPrevious = computed(() => currentPage.value > 1);

  const hasNext = computed(() => currentPage.value < totalPages.value);

  const isEmpty = computed(() => totalItems.value === 0);

  const isFirstPage = computed(() => currentPage.value === 1);

  const isLastPage = computed(() => currentPage.value === totalPages.value);

  // Methods
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      saveState();

      console.log('[pagination][navigation] Page changed', {
        newPage: page,
        totalPages: totalPages.value,
        totalItems: totalItems.value,
        itemsPerPage: itemsPerPage.value,
      });
    }
  };

  const goToFirst = () => {
    goToPage(1);
  };

  const goToPrevious = () => {
    if (hasPrevious.value) {
      goToPage(currentPage.value - 1);
    }
  };

  const goToNext = () => {
    if (hasNext.value) {
      goToPage(currentPage.value + 1);
    }
  };

  const goToLast = () => {
    goToPage(totalPages.value);
  };

  const setItemsPerPage = (newItemsPerPage: number) => {
    if (itemsPerPageOptions.includes(newItemsPerPage)) {
      const oldItemsPerPage = itemsPerPage.value;

      // Calculate what the new current page should be to show similar items
      const currentFirstItem = startItem.value;
      const newPage = Math.ceil(currentFirstItem / newItemsPerPage);

      itemsPerPage.value = newItemsPerPage;
      currentPage.value = Math.min(newPage, Math.ceil(totalItems.value / newItemsPerPage));
      saveState();

      console.log('[pagination][configuration] Items per page changed', {
        oldItemsPerPage,
        newItemsPerPage,
        newPage: currentPage.value,
        totalItems: totalItems.value,
      });
    }
  };

  const reset = () => {
    currentPage.value = initialPage;
    itemsPerPage.value = initialItemsPerPage;
    saveState();

    console.log('[pagination][reset] Pagination reset to initial state', {
      page: initialPage,
      itemsPerPage: initialItemsPerPage,
    });
  };

  // Watch for items changes and adjust current page if necessary
  watch(
    totalItems,
    newTotal => {
      const maxPage = Math.ceil(newTotal / itemsPerPage.value);
      if (currentPage.value > maxPage && maxPage > 0) {
        currentPage.value = maxPage;
        saveState();

        console.log('[pagination][auto-adjust] Current page adjusted due to items change', {
          newTotal,
          maxPage,
          adjustedPage: currentPage.value,
        });
      }
    },
    { immediate: false }
  );

  // Watch for itemsPerPage changes and adjust current page if necessary
  watch(
    itemsPerPage,
    newItemsPerPage => {
      const maxPage = Math.ceil(totalItems.value / newItemsPerPage);
      if (currentPage.value > maxPage && maxPage > 0) {
        currentPage.value = maxPage;
        saveState();

        console.log(
          '[pagination][auto-adjust] Current page adjusted due to items per page change',
          {
            newItemsPerPage,
            maxPage,
            adjustedPage: currentPage.value,
          }
        );
      }
    },
    { immediate: false }
  );

  // Watch for direct changes to currentPage and itemsPerPage (for v-model support)
  watch(currentPage, () => {
    saveState();
  });

  watch(itemsPerPage, () => {
    saveState();
  });

  return {
    // State
    currentPage: readonly(currentPage),
    itemsPerPage: readonly(itemsPerPage),

    // Computed
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    startItem,
    endItem,
    hasPrevious,
    hasNext,
    isEmpty,
    isFirstPage,
    isLastPage,

    // Methods
    goToPage,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLast,
    setItemsPerPage,
    reset,

    // For v-model support
    updateCurrentPage: (page: number) => {
      currentPage.value = page;
      // saveState is called automatically by the watcher
    },
    updateItemsPerPage: (items: number) => {
      setItemsPerPage(items);
      // saveState is called by setItemsPerPage
    },

    // Options
    itemsPerPageOptions,
  };
}

// Type exports
export type PaginationReturn<T> = ReturnType<typeof usePagination<T>>;
