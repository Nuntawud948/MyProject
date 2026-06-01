/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  SearchX,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataFilterBar, FilterOption } from './DataFilterBar';

import { PaginatedDto } from '@/dto/common/paginated-dto';

export type FilterableColumnDef<TData, TValue = any> = ColumnDef<TData, TValue> & {
  filterable?: boolean;
};

export interface DataTableProps<TData, TValue> {
  columns: FilterableColumnDef<TData, TValue>[];
  paginatedData?: PaginatedDto<TData>;

  // Dynamic filter configuration
  filterOptions?: FilterOption[];
  filters?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  filterslot?: number;

  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Status flags
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  paginatedData = { items: [], totalCount: 0, pageSize: 10, pageIndex: 0 },
  filterOptions = [],
  filters = {},
  onFilterChange,
  onClearFilters,
  filterslot = 3,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  error = null,
  onRetry
}: DataTableProps<TData, TValue>) {
  // Local state for interactive header column filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const { items = [], totalCount = 0, pageSize = 10, pageIndex = 0 } = paginatedData;

  // Memoized local filtering for columns flagged as filterable: true
  const filteredRows = useMemo(() => {
    let result = items;
    const activeKeys = Object.keys(columnFilters).filter((k) => columnFilters[k].trim() !== '');
    if (activeKeys.length === 0) return result;

    return result.filter((row: any) => {
      return activeKeys.every((colId) => {
        const query = columnFilters[colId].trim().toLowerCase();
        const val = row[colId];
        if (val === undefined || val === null) return false;
        
        if (val instanceof Date) {
          const dateStr = val.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
          return dateStr.includes(query);
        }
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [items, columnFilters]);

  // Setup Tanstack Table instance matching the filtered or default collection
  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // we handle pagination state changes in parent to mirror .NET endpoint integration
  });

  const totalRecords = totalCount || items.length;
  const pageCount = Math.max(1, Math.ceil(totalRecords / pageSize));
  
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  // Clear column-specific inline filters as well when all filters are cleared
  const handleClearEverything = () => {
    setColumnFilters({});
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Embed Dynamic Filter Bar */}
      {filterOptions && filterOptions.length > 0 && onFilterChange && onClearFilters && (
        <DataFilterBar
          options={filterOptions}
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={handleClearEverything}
          filterslot={filterslot}
        />
      )}

      {/* 2. Main Table Area */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Error Alert Overlay */}
        {error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center bg-red-50/20 border-b border-slate-100 min-h-[300px]">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 ring-8 ring-red-50/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">API Connection Outage</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              {error || 'An error occurred while communicating with the remote HRMS endpoint service. Please verify your connection.'}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-4 text-xs font-semibold gap-2 border-red-200 text-red-700 bg-white hover:bg-slate-50 shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Retry Request Loop
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isFilterable = (header.column.columnDef as any).filterable;
                    return (
                      <TableHead key={header.id} className="text-slate-600 py-3.5">
                        {header.isPlaceholder ? null : (
                          <div className="flex flex-col gap-1.5 justify-center">
                            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {isFilterable && (
                              <div className="relative mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  placeholder="Filter..."
                                  value={columnFilters[header.id] ?? ''}
                                  onChange={(e) => {
                                    setColumnFilters((prev) => ({
                                      ...prev,
                                      [header.id]: e.target.value
                                    }));
                                  }}
                                  className="h-7 text-[11px] px-2 py-1 bg-slate-50 hover:bg-white text-slate-800 border-slate-200 focus:border-slate-800 focus:bg-white focus:ring-0 placeholder:text-slate-400 font-medium font-sans w-full min-w-[75px]"
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
              {/* IsLoading Skeleton States */}
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, rIdx) => (
                  <TableRow key={`skele-row-${rIdx}`} className="hover:bg-transparent">
                    {columns.map((_, cIdx) => (
                      <TableCell key={`skele-cell-${cIdx}`} className="py-4">
                        <div className="h-4.5 bg-slate-100 rounded-md animate-pulse shrink-0" style={{ width: cIdx === 0 ? '60px' : cIdx === 4 ? '100px' : '150px' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredRows.length === 0 ? (
                /* Empty Results State */
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      {/* Minimal visual vector illustration */}
                      <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-3xs">
                        <SearchX className="h-7 w-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Clear your queries</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                        No employees found matching the filters or active parameters. Try expanding your search options.
                      </p>
                      {(onClearFilters || Object.keys(columnFilters).length > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearEverything}
                          className="mt-4.5 text-xs text-slate-700 font-semibold cursor-pointer shadow-2xs h-8 border-slate-200"
                        >
                          Reset Filters Only
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* Success Rows Rendering */
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

      {/* 3. Bottom Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-2xs">
        {/* Total Records Summary */}
        <div className="text-xs text-slate-500 font-semibold text-center sm:text-left select-none">
          Showing <span className="text-slate-800 font-bold">{items.length}</span> of{' '}
          <span className="text-slate-800 font-bold">{totalRecords}</span> entries
        </div>

        {/* Navigation triggers */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Row size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold select-none">Rows per page:</span>
            <div className="w-18">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  if (onPageSizeChange) onPageSizeChange(Number(val));
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-slate-50 text-slate-700 border-slate-200">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Page Index numbers */}
          <div className="text-xs font-semibold text-slate-600 select-none">
            Page <span className="text-slate-900 font-bold">{pageIndex + 1}</span> of{' '}
            <span className="text-slate-900 font-bold">{pageCount}</span>
          </div>

          {/* Arrow Buttons trigger */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-500 border-slate-200 bg-white"
              disabled={!canGoPrevious || isLoading}
              onClick={() => onPageChange?.(0)}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-500 border-slate-200 bg-white"
              disabled={!canGoPrevious || isLoading}
              onClick={() => onPageChange?.(pageIndex - 1)}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-500 border-slate-200 bg-white"
              disabled={!canGoNext || isLoading}
              onClick={() => onPageChange?.(pageIndex + 1)}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-500 border-slate-200 bg-white"
              disabled={!canGoNext || isLoading}
              onClick={() => onPageChange?.(pageCount - 1)}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
