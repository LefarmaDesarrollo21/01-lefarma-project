import type { ColumnDef } from '@tanstack/react-table';

/**
 * Supported filter types based on column data type
 */
export type FilterType = 'text' | 'number' | 'boolean' | 'select';

/**
 * Operators for text filters
 */
export type TextOperator = 'contains' | 'exact' | 'startsWith' | 'endsWith';

/**
 * Operators for number filters
 */
export type NumberOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between';

/**
 * Values for boolean filters
 */
export type BooleanValue = 'all' | 'true' | 'false';

/**
 * Active filter on a column
 */
export interface ColumnFilter {
  columnId: string;
  type: FilterType;
  operator: TextOperator | NumberOperator | BooleanValue;
  value: string | number | boolean | string[];
  displayLabel: string; // Human-readable label for badges
}

/**
 * Configuration for a single column's filter behavior
 */
export interface ColumnFilterConfig {
  type: FilterType;
  // For 'select' type - available options
  options?: { value: string; label: string }[];
  // For 'number' type - min/max values
  min?: number;
  max?: number;
}

/**
 * Configuration passed to DataTable for filters
 */
export interface FilterConfig<TData> {
  tableId: string;
  searchableColumns: string[]; // All columns that CAN be searched
  defaultSearchColumns?: string[]; // Default columns to search (subset of searchableColumns)
  columnFilterConfigs?: Record<string, ColumnFilterConfig>;
}

/**
 * Complete table configuration stored in localStorage
 */
export interface TableConfig {
  tableId: string;
  visibleColumns: string[];
  searchColumns: string[];
  lastFilters?: Record<string, ColumnFilter>;
}

/**
 * State returned by useTableFilters hook
 */
export interface UseTableFiltersReturn {
  // State
  activeFilters: ColumnFilter[];
  searchColumnIds: string[];
  visibleColumnIds: string[];

  // Actions
  addFilter: (filter: ColumnFilter) => void;
  removeFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  setSearchColumns: (columnIds: string[]) => void;
  setVisibleColumns: (columnIds: string[]) => void;
  resetToDefaults: () => void;

  // Persistence
  saveConfig: () => void;
  loadConfig: () => void;
}
