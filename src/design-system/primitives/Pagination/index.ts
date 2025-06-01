export { default as Pagination } from './Pagination.vue';

// Re-export types for external use
export type PaginationProps = {
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
};

export type PaginationEmits = {
  'update:currentPage': [page: number];
  'update:itemsPerPage': [itemsPerPage: number];
  pageChange: [page: number, previousPage: number];
  itemsPerPageChange: [itemsPerPage: number, previousItemsPerPage: number];
};

export type PaginationSlotProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  hasPrevious: boolean;
  hasNext: boolean;
  pages: (number | 'ellipsis')[];
  canGoToFirst: boolean;
  canGoToLast: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onPage: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions: number[];
};
