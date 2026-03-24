import { useState, useCallback, useEffect, useRef } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  ColumnFilter,
  ColumnFilterConfig,
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
  columnFilterConfigs: initialColumnFilterConfigs = {},
}: {
  tableId: string;
  allColumns: ColumnDef<TData>[];
  defaultSearchColumns?: string[];
  columnFilterConfigs?: Record<string, ColumnFilterConfig>;
}): UseTableFiltersReturn {
  // Extract column IDs from column definitions
  // Use same logic as DataTable: try col.id, then accessorKey
  const allColumnIds = allColumns
    .map(col => col.id || (('accessorKey' in col && typeof col.accessorKey === 'string') ? col.accessorKey : '') || '')
    .filter(id => id !== null && id !== undefined && id !== '');

  // State
  const [activeFilters, setActiveFilters] = useState<ColumnFilter[]>([]);
  const [searchColumnIds, setSearchColumnIds] = useState<string[]>(defaultSearchColumns);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(allColumnIds);
  const [columnFilterConfigs, setColumnFilterConfigs] = useState<Record<string, ColumnFilterConfig>>(initialColumnFilterConfigs);

  // Track initialization to prevent auto-save race condition
  const isInitialized = useRef(false);

  // Load config on mount
  useEffect(() => {
    loadConfig();
    isInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setVisibleColumnIds(defaults.visibleColumns); // This is allColumnIds
    setColumnFilterConfigs({});

    // Save the default config immediately so it persists
    saveConfigToStorage(defaults);
  }, [tableId, allColumnIds, defaultSearchColumns, saveConfigToStorage]);

  const setColumnFilterConfig = useCallback((columnId: string, config: ColumnFilterConfig) => {
    setColumnFilterConfigs(prev => ({
      ...prev,
      [columnId]: config,
    }));
  }, []);

  // Persistence
  const saveConfig = useCallback(() => {
    const config: TableConfig = {
      tableId,
      visibleColumns: allColumnIds, // ALWAYS save ALL columns as visible
      searchColumns: searchColumnIds,
      lastFilters: activeFilters.reduce((acc, filter) => {
        acc[filter.columnId] = filter;
        return acc;
      }, {} as Record<string, ColumnFilter>),
    };
    saveConfigToStorage(config);
  }, [tableId, allColumnIds, searchColumnIds, activeFilters]);

  const loadConfig = useCallback(() => {
    const saved = getConfig(tableId);
    if (saved) {
      // Always show ALL columns - ignore saved visibility config
      // This ensures checkboxes are always checked by default
      setVisibleColumnIds(allColumnIds);

      // Clean searchColumns to remove nulls/undefined
      const cleanSearchColumns = saved.searchColumns.filter(id => id && allColumnIds.includes(id));
      setSearchColumnIds(cleanSearchColumns);

      if (saved.lastFilters) {
        setActiveFilters(Object.values(saved.lastFilters));
      }
      if (saved.columnFilterConfigs) {
        setColumnFilterConfigs(saved.columnFilterConfigs);
      }

      // Update saved config to have all columns visible (cleanup old configs)
      const updatedConfig: TableConfig = {
        tableId,
        visibleColumns: allColumnIds, // Update to all columns
        searchColumns: cleanSearchColumns,
        lastFilters: saved.lastFilters,
        columnFilterConfigs: saved.columnFilterConfigs,
      };
      saveConfigToStorage(updatedConfig);
    } else {
      // Create default config on first visit - ALL columns visible
      const defaults = createDefaultConfig(tableId, allColumnIds, defaultSearchColumns);
      setSearchColumnIds(defaults.searchColumns);
      setVisibleColumnIds(defaults.visibleColumns);
      saveConfigToStorage(defaults);
    }
  }, [tableId, allColumnIds, defaultSearchColumns, saveConfigToStorage]);

  // Auto-save when state changes (only after initialization)
  useEffect(() => {
    if (isInitialized.current) {
      saveConfig();
    }
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
    setColumnFilterConfig,
    columnFilterConfigs,
    saveConfig,
    loadConfig,
  };
}
