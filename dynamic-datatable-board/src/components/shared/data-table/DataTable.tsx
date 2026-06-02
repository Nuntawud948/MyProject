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
  ArrowUpDown
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataFilterBar, FilterOption } from './DataFilterBar';
import { PaginatedDto } from '@/dto/common/paginated-dto';

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
  accessorKey?: string; // 👈 Add this line to satisfy TypeScript
  filterable?: boolean; // For inline header text filter
  // --- ALIGNMENT OPTIONS ---
  align?: 'left' | 'center' | 'right' | 'justify';        // Alignment for the cell content
  headerAlign?: 'left' | 'center' | 'right' | 'justify';  // Alignment for the header (defaults to `align` if omitted)
  // Custom Dynamic Filter Bar configuration
  isGlobalFilter?: boolean;
  filterType?: 'string' | 'select' | 'date' | 'boolean';
  filterLabel?: string;
  filterPlaceholder?: string;
  filterApiEndpoint?: string;
  filterTextProperty?: string;
  filterValueProperty?: string;
};

export interface DataTableProps<TData, TValue> {
  columns: DataTableColumnDef<TData, TValue>[];
  extraFilterOptions?: FilterOption[]; // For filters that don't have a visible table column
  filterslot?: number;

  // The core API fetching bridge
  fetchData: (params: TableQueryParams) => Promise<PaginatedDto<TData>>;

  // Optional callback to send data back to parent for things like KPI Metric cards
  onDataLoaded?: (items: TData[], totalCount: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  extraFilterOptions = [],
  filterslot = 3,
  fetchData,
  onDataLoaded
}: DataTableProps<TData, TValue>) {

  // Keep references to fetch and loaded callbacks fresh to avoid infinite loop cycles
  const fetchDataRef = useRef(fetchData);
  const onDataLoadedRef = useRef(onDataLoaded);

  useEffect(() => {
    fetchDataRef.current = fetchData;
    onDataLoadedRef.current = onDataLoaded;
  }, [fetchData, onDataLoaded]);

  // --- INTERNAL STATE ---
  const [data, setData] = useState<TData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Auto-Extract Filters from your Columns
  const combinedFilterOptions = useMemo(() => {
    const extractedOptions = columns
      .filter((col) => col.isGlobalFilter && col.accessorKey)
      .map((col) => ({
        key: col.accessorKey as string,
        label: col.filterLabel || (col.header as string),
        type: col.filterType || 'string',
        placeholder: col.filterPlaceholder,
        apiEndpoint: col.filterApiEndpoint,
        textProperty: col.filterTextProperty,
        valueProperty: col.filterValueProperty,
        filterable: col.filterable !== false, // 👈 Enable search by default unless explicitly disabled
      } as FilterOption));

    return [...extractedOptions, ...extraFilterOptions];
  }, [columns, extraFilterOptions]);

  // --- API DATA FETCHING ---
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Merge all active filters
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

  // Trigger fetch when parameters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- TANSTACK TABLE CONFIG ---
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
      {/* Dynamic Filter Bar */}
      {combinedFilterOptions.length > 0 && (
        <DataFilterBar
          options={combinedFilterOptions}
          filters={globalFilters}
          onFilterChange={(key, value) => {
            setGlobalFilters(prev => ({ ...prev, [key]: value }));
            setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page on new filter
          }}
          onClearFilters={handleClearEverything}
          filterslot={filterslot}
        />
      )}

      {/* Main Table Area */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
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
                                  value={columnFilters[header.id] ?? ''}
                                  onChange={(e) => {
                                    setColumnFilters((prev) => ({ ...prev, [header.id]: e.target.value }));
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