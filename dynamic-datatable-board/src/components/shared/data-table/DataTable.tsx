/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SearchX,
  AlertTriangle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PaginatedDto } from '@/dto/common/paginated-dto';
import axiosClient from '../../../api/axiosClient';

// --- API Request Parameters ---
export interface TableQueryParams {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters: Record<string, any>;
}

// --- Extended Column Definition for Dynamic Filters ---
export type DataTableColumnDef<TData, TValue = any> = ColumnDef<TData, TValue> & {
  accessorKey?: string;
  filterable?: boolean;
  filterablebar?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  headerAlign?: 'left' | 'center' | 'right' | 'justify';
  isGlobalFilter?: boolean;
  filterType?: 'string' | 'select' | 'date' | 'boolean';
  filterLabel?: string;
  filterPlaceholder?: string;
  filterApiEndpoint?: string;
  filterTextProperty?: string;
  filterValueProperty?: string;
};

export interface FilterOptionOption {
  label: string;
  value: string;
  [key: string]: any;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'string' | 'number' | 'datetime' | 'select';
  placeholder?: string;
  options?: FilterOptionOption[];
  filterable?: boolean;
  apiEndpoint?: string;
  textProperty?: string;
  valueProperty?: string;
}

// Helper component to auto-focus search boxes immediately upon select content mounting
function FilterSearchInput({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder || "Search options..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
      className="flex h-7 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0"
    />
  );
}

interface DataFilterBarProps {
  options: FilterOption[];
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  filterslot?: number;
}

function DataFilterBar({
  options,
  filters,
  onFilterChange,
  onClearFilters,
  filterslot = 3
}: DataFilterBarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loadedOptions, setLoadedOptions] = useState<Record<string, any[]>>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState<Record<string, boolean>>({});
  const [dropdownSearch, setDropdownSearch] = useState<Record<string, string>>({});

  useEffect(() => {
    options.forEach((opt) => {
      if (opt.apiEndpoint && !loadedOptions[opt.key] && !isLoadingOptions[opt.key]) {
        setIsLoadingOptions((prev) => ({ ...prev, [opt.key]: true }));

        const fetchOptions = async () => {
          try {
            const res = await axiosClient.get(opt.apiEndpoint!);
            const data = res.data?.data || res.data || [];
            setLoadedOptions((prev) => ({ ...prev, [opt.key]: data }));
          } catch (err) {
            console.error(`Failed to fetch dynamic filter options for key ${opt.key}:`, err);
            // Fallback options
            setLoadedOptions((prev) => ({ ...prev, [opt.key]: opt.options || [] }));
          } finally {
            setIsLoadingOptions((prev) => ({ ...prev, [opt.key]: false }));
          }
        };

        fetchOptions();
      }
    });
  }, [options, loadedOptions, isLoadingOptions]);

  const activeCount = Object.keys(filters).filter((k) => {
    const val = filters[k];
    return val !== undefined && val !== '' && val !== null;
  }).length;

  const formatDateLabel = (val: any) => {
    if (!val) return 'Pick a date';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return 'Pick a date';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderField = (opt: FilterOption) => {
    const value = filters[opt.key] ?? '';

    switch (opt.type) {
      case 'select':
        const rawItems = opt.apiEndpoint ? (loadedOptions[opt.key] || []) : (opt.options || []);
        const textProp = opt.textProperty || 'label';
        const valProp = opt.valueProperty || 'value';
        const searchVal = dropdownSearch[opt.key] || '';
        const isOptLoading = !!isLoadingOptions[opt.key];

        const displayItems = rawItems.filter((item) => {
          const labelText = String(item[textProp] ?? item.label ?? '');
          return labelText.toLowerCase().includes(searchVal.toLowerCase());
        });

        return (
          <div key={opt.key} className="flex flex-col gap-1 w-full min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{opt.label}</label>
            <Select
              value={value ? String(value) : undefined}
              onValueChange={(val) => onFilterChange(opt.key, val)}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-700">
                {isOptLoading ? (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    Loading...
                  </span>
                ) : value ? (
                  <span className="truncate">
                    {rawItems.find(item => String(item[valProp] ?? item.value ?? '') === String(value))?.[textProp] || value}
                  </span>
                ) : (
                  <SelectValue placeholder={opt.placeholder ?? `All ${opt.label}s`} />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {opt.label}s</SelectItem>

                {opt.filterable && (
                  <div className="p-1 border-b border-slate-100 mb-1" onClick={(e) => e.stopPropagation()}>
                    <FilterSearchInput
                      placeholder="Search options..."
                      value={searchVal}
                      onChange={(value) => {
                        setDropdownSearch(prev => ({
                          ...prev,
                          [opt.key]: value
                        }));
                      }}
                    />
                  </div>
                )}

                {isOptLoading ? (
                  <div className="py-2 text-center text-xs text-slate-400 font-medium">Fetching options...</div>
                ) : displayItems.length === 0 ? (
                  <div className="py-2 text-center text-xs text-slate-400 font-medium">No results found</div>
                ) : (
                  displayItems.map((subOpt, i) => {
                    const label = String(subOpt[textProp] ?? subOpt.label ?? '');
                    const val = String(subOpt[valProp] ?? subOpt.value ?? '');
                    return (
                      <SelectItem key={`${val}-${i}`} value={val}>
                        {label}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        );

      case 'datetime':
        const currentDate = value ? (value instanceof Date ? value : new Date(value)) : undefined;
        return (
          <div key={opt.key} className="flex flex-col gap-1 w-full min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{opt.label}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-9 bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-60 text-slate-600" />
                  <span className="truncate">{formatDateLabel(currentDate)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="left">
                <Calendar
                  selected={currentDate}
                  onSelect={(date) => onFilterChange(opt.key, date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'string':
      default:
        return (
          <div key={opt.key} className="flex flex-col gap-1 w-full min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{opt.label}</label>
            <Input
              type="text"
              placeholder={opt.placeholder ?? `Search ${opt.label}...`}
              value={value}
              onChange={(e) => onFilterChange(opt.key, e.target.value)}
              className="bg-white border-slate-200"
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 md:p-4 shadow-2xs">
      <div className="flex md:hidden items-center justify-between w-full">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 outline-none pb-0 cursor-pointer"
        >
          <Filter className="h-4.5 w-4.5 text-slate-500" />
          <span>Filters & Queries</span>
          {activeCount > 0 && (
            <span className="bg-slate-900 text-white font-mono font-bold text-[10px] h-4.5 w-4.5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs text-red-600 font-semibold flex items-center gap-1.5 hover:bg-red-50"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            {isMobileOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`${isMobileOpen ? 'block mt-3 border-t border-slate-200/80 pt-3' : 'hidden'} md:block space-y-4`}>
        <div className={`grid gap-4 items-end ${filterslot === 1 ? 'grid-cols-1' :
          filterslot === 2 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' :
            filterslot === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              filterslot === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
                filterslot === 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5' :
                  filterslot === 6 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6' :
                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
          {options.map((opt) => renderField(opt))}

          <div className={`hidden md:flex justify-end pb-0.5 ${filterslot === 1 ? 'col-span-1' :
            filterslot === 2 ? 'col-span-1 sm:col-span-2 lg:col-span-2 lg:justify-start lg:col-span-1' :
              filterslot === 3 ? 'col-span-1 sm:col-span-2 lg:col-span-3 lg:justify-start lg:col-span-1' :
                filterslot === 4 ? 'col-span-1 sm:col-span-2 lg:col-span-4 lg:justify-start lg:col-span-1' :
                  filterslot === 5 ? 'col-span-1 sm:col-span-2 lg:col-span-5 lg:justify-start lg:col-span-1' :
                    filterslot === 6 ? 'col-span-1 sm:col-span-2 lg:col-span-6 lg:justify-start lg:col-span-1' :
                      'col-span-1 sm:col-span-2 lg:col-span-3 lg:justify-start lg:col-span-1'
            }`}>
            {activeCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="w-full sm:w-auto h-9 text-xs border-red-200 hover:border-red-300 text-red-600 font-semibold bg-white flex items-center justify-center gap-1.5 hover:bg-red-50/70 shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear Active Filters
              </Button>
            ) : (
              <div className="h-9 flex items-center text-xs font-medium text-slate-400 pl-1.5 select-none italic">
                No active filters applied
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DataTableProps<TData, TValue> {
  columns: DataTableColumnDef<TData, TValue>[];
  extraFilterOptions?: FilterOption[];
  filterslot?: number;
  filterableActive?: boolean; // Controls whether filter panel shows
  fetchData: (params: TableQueryParams) => Promise<PaginatedDto<TData>>;
  onDataLoaded?: (items: TData[], totalCount: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  extraFilterOptions = [],
  filterslot = 3,
  filterableActive = false,
  fetchData,
  onDataLoaded
}: DataTableProps<TData, TValue>) {

  const fetchDataRef = useRef(fetchData);
  const onDataLoadedRef = useRef(onDataLoaded);

  useEffect(() => {
    fetchDataRef.current = fetchData;
    onDataLoadedRef.current = onDataLoaded;
  }, [fetchData, onDataLoaded]);

  const [data, setData] = useState<TData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const combinedFilterOptions = useMemo(() => {
    const extractedOptions = columns
      .filter((col) => (col.filterablebar || col.isGlobalFilter) && col.accessorKey)
      .map((col) => ({
        key: col.accessorKey as string,
        label: col.filterLabel || (col.header as string),
        type: (col.filterType === 'select' ? 'select' : col.filterType === 'date' ? 'datetime' : 'string') as any,
        placeholder: col.filterPlaceholder,
        apiEndpoint: col.filterApiEndpoint,
        textProperty: col.filterTextProperty,
        valueProperty: col.filterValueProperty,
        filterable: col.filterable !== false,
      } as FilterOption));

    return [...extractedOptions, ...extraFilterOptions];
  }, [columns, extraFilterOptions]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters = { ...globalFilters };
      Object.entries(columnFilters).forEach(([key, value]) => {
        if (value.trim()) activeFilters[key] = value.trim();
      });

      const queryParams: TableQueryParams = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy: sorting.length > 0 ? sorting[0].id : undefined,
        sortDirection: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
        filters: activeFilters,
      };

      const result = await fetchDataRef.current(queryParams);

      setData(result.items);
      setTotalCount(result.totalCount);

      if (onDataLoadedRef.current) {
        onDataLoadedRef.current(result.items, result.totalCount);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, globalFilters, columnFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const pageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize));
  const canGoPrevious = pagination.pageIndex > 0;
  const canGoNext = pagination.pageIndex < pageCount - 1;

  const handleClearEverything = () => {
    setColumnFilters({});
    setGlobalFilters({});
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setSorting([]);
  };

  return (
    <div className="space-y-4">
      {/* Filter panel is only visible if filterableActive is explicitly set to true */}
      {filterableActive && combinedFilterOptions.length > 0 && (
        <DataFilterBar
          options={combinedFilterOptions}
          filters={globalFilters}
          onFilterChange={(key, value) => {
            setGlobalFilters(prev => ({ ...prev, [key]: value }));
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
          }}
          onClearFilters={handleClearEverything}
          filterslot={filterslot}
        />
      )}

      {/* Main Table Area */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-xs min-h-[220px]">
        {error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center bg-red-50/20 border-b border-slate-100 min-h-[300px]">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 ring-8 ring-red-50/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">API Connection Outage</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{error}</p>
            <Button variant="outline" size="sm" onClick={loadData} className="mt-4 gap-2 text-xs text-red-700 bg-white hover:bg-slate-50 border-red-200">
              <RefreshCw className="h-3 w-3" /> Retry Request
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isFilterable = (header.column.columnDef as any).filterable;
                    const canSort = header.column.getCanSort();

                    return (
                      <TableHead key={header.id} className="text-slate-600 py-3.5 align-top">
                        {header.isPlaceholder ? null : (
                          <div className="flex flex-col gap-1.5 justify-start">
                            <div
                              className={`flex items-center gap-1 text-xs uppercase tracking-wider text-slate-700 font-bold ${canSort ? 'cursor-pointer select-none hover:text-slate-900' : ''}`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {canSort && (
                                <span className="text-slate-400">
                                  {{
                                    asc: <ArrowUp className="h-3 w-3 text-emerald-600" />,
                                    desc: <ArrowDown className="h-3 w-3 text-red-600" />,
                                  }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="h-3 w-3 opacity-50" />}
                                </span>
                              )}
                            </div>

                            {isFilterable && (
                              <div className="relative mt-1" onClick={e => e.stopPropagation()}>
                                <Input
                                  placeholder="Filter..."
                                  value={columnFilters[header.column.id] ?? ''}
                                  onChange={(e) => {
                                    setColumnFilters((prev) => ({ ...prev, [header.column.id]: e.target.value }));
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                  }}
                                  className="h-7 text-[11px] px-2 py-1 bg-slate-50 hover:bg-white text-slate-800 border-slate-200 focus:border-slate-800 focus:bg-white placeholder:text-slate-400 font-medium w-full min-w-[75px]"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: pagination.pageSize }).map((_, rIdx) => (
                  <TableRow key={`skele-row-${rIdx}`}>
                    {columns.map((_, cIdx) => (
                      <TableCell key={`skele-cell-${cIdx}`} className="py-4">
                        <div className="h-4.5 bg-slate-100 rounded-md animate-pulse shrink-0" style={{ width: cIdx === 0 ? '60px' : '100px' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-3xs">
                        <SearchX className="h-7 w-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No records found</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                        No results found matching the active filters or search queries.
                      </p>
                      {(Object.keys(globalFilters).length > 0 || Object.keys(columnFilters).length > 0) && (
                        <Button variant="outline" size="sm" onClick={handleClearEverything} className="mt-4 text-xs font-semibold">
                          Reset Filters Only
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-slate-700 text-xs md:text-sm font-medium py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-2xs">
        <div className="text-xs text-slate-500 font-semibold text-center sm:text-left select-none">
          Showing <span className="text-slate-800 font-bold">{data.length}</span> of{' '}
          <span className="text-slate-800 font-bold">{totalCount}</span> entries
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold select-none">Rows per page:</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) => setPagination({ pageIndex: 0, pageSize: Number(val) })}
            >
              <SelectTrigger className="h-8 w-18 text-xs bg-slate-50 text-slate-700 border-slate-200">
                <SelectValue placeholder={String(pagination.pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs font-semibold text-slate-600 select-none">
            Page <span className="text-slate-900 font-bold">{pagination.pageIndex + 1}</span> of{' '}
            <span className="text-slate-900 font-bold">{pageCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200 bg-white" disabled={!canGoPrevious || isLoading} onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200 bg-white" disabled={!canGoPrevious || isLoading} onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200 bg-white" disabled={!canGoNext || isLoading} onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200 bg-white" disabled={!canGoNext || isLoading} onClick={() => setPagination(p => ({ ...p, pageIndex: pageCount - 1 }))}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}