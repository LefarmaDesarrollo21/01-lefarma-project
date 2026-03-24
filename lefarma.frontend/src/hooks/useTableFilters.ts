import { useState, useCallback, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  ColumnFilter,
  FilterConfig,
  TableConfig,
  UseTableFiltersReturn,
} from '@/types/table.types';
import {
  getConfig,
  saveConfig as saveConfigToStorage,
  resetConfig as resetConfigInStorage,
  createDefaultConfig,
} from '@/lib/tableConfigStorage';

export function useTableFilters<TData>({
  tableId,
  allColumns,
  defaultSearchColumns = [],
  searchableColumns,
}: {
  tableId: string;
  allColumns: ColumnDef<TData>[];
  defaultSearchColumns?: string[];
  searchableColumns: string[];
}): UseTableFiltersReturn {
  // Extract column IDs from column definitions
  const allColumnIds = allColumns.map(col => col.id || col.accessorKey as string);

  // State
  const [activeFilters, setActiveFilters] = useState<ColumnFilter[]>([]);
  const [searchColumnIds, setSearchColumnIds] = useState<string[]>(defaultSearchColumns);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(allColumnIds);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [tableId]);

  // Actions
  const addFilter = useCallback((filter: ColumnFilter) => {
    setActiveFilters(prev => {
      // Remove existing filter for same column
      const filtered = prev.filter(f => f.columnId !== filter.columnId);
      return [...filtered, filter];
    });
  }, []);

  const removeFilter = useCallback((columnId: string) => {
    setActiveFilters(prev => prev.filter(f => f.columnId !== columnId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  const setSearchColumns = useCallback((columnIds: string[]) => {
    setSearchColumnIds(columnIds);
  }, []);

  const setVisibleColumns = useCallback((columnIds: string[]) => {
    setVisibleColumnIds(columnIds);
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = createDefaultConfig(tableId, allColumnIds, defaultSearchColumns);
    setActiveFilters([]);
    setSearchColumnIds(defaults.searchColumns);
    setVisibleColumnIds(defaults.visibleColumns);
    resetConfigInStorage(tableId);
  }, [tableId, allColumnIds, defaultSearchColumns]);

  // Persistence
  const saveConfig = useCallback(() => {
    const config: TableConfig = {
      tableId,
      visibleColumns: visibleColumnIds,
      searchColumns: searchColumnIds,
      lastFilters: activeFilters.reduce((acc, filter) => {
        acc[filter.columnId] = filter;
        return acc;
      }, {} as Record<string, ColumnFilter>),
    };
    saveConfigToStorage(config);
  }, [tableId, visibleColumnIds, searchColumnIds, activeFilters]);

  const loadConfig = useCallback(() => {
    const saved = getConfig(tableId);
    if (saved) {
      setSearchColumnIds(saved.searchColumns);
      setVisibleColumnIds(saved.visibleColumns);
      if (saved.lastFilters) {
        setActiveFilters(Object.values(saved.lastFilters));
      }
    } else {
      // Create default config on first visit
      const defaults = createDefaultConfig(tableId, allColumnIds, defaultSearchColumns);
      setSearchColumnIds(defaults.searchColumns);
      setVisibleColumnIds(defaults.visibleColumns);
      saveConfigToStorage(defaults);
    }
  }, [tableId, allColumnIds, defaultSearchColumns]);

  // Auto-save when state changes
  useEffect(() => {
    saveConfig();
  }, [activeFilters, searchColumnIds, visibleColumnIds, saveConfig]);

  return {
    activeFilters,
    searchColumnIds,
    visibleColumnIds,
    addFilter,
    removeFilter,
    clearAllFilters,
    setSearchColumns,
    setVisibleColumns,
    resetToDefaults,
    saveConfig,
    loadConfig,
  };
}
