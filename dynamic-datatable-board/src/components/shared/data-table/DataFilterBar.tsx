/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Filter, Calendar as CalendarIcon, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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
        // Prevent key events from bubbling up and triggering close actions or parent key actions
        e.stopPropagation();
      }}
      className="flex h-7 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0"
    />
  );
}

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

export interface DataFilterBarProps {
  options: FilterOption[];
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  filterslot?: number;
}

export function DataFilterBar({
  options,
  filters,
  onFilterChange,
  onClearFilters,
  filterslot = 3
}: DataFilterBarProps) {
  // Mobile accordion toggle state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loadedOptions, setLoadedOptions] = useState<Record<string, any[]>>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState<Record<string, boolean>>({});
  const [dropdownSearch, setDropdownSearch] = useState<Record<string, string>>({});

  // Fetch dynamic options if an API endpoint is specified
  useEffect(() => {
    options.forEach((opt) => {
      if (opt.apiEndpoint && !loadedOptions[opt.key] && !isLoadingOptions[opt.key]) {
        setIsLoadingOptions((prev) => ({ ...prev, [opt.key]: true }));

        // Simulating the dynamic HTTP list request with our system's departments
        setTimeout(() => {
          let payload: any[] = [];
          if (opt.apiEndpoint?.includes('departments')) {
            // Emits records using custom key properties to show textProperty/valueProperty mapping
            payload = [
              { deptTitle: 'Engineering', deptId: 'Engineering' },
              { deptTitle: 'Product Management', deptId: 'Product Management' },
              { deptTitle: 'Sales & Growth', deptId: 'Sales & Growth' },
              { deptTitle: 'Marketing', deptId: 'Marketing' },
              { deptTitle: 'Creative & Design', deptId: 'Creative & Design' },
              { deptTitle: 'Human Resources', deptId: 'Human Resources' },
              { deptTitle: 'Finance', deptId: 'Finance' }
            ];
          } else {
            payload = opt.options || [];
          }

          setLoadedOptions((prev) => ({ ...prev, [opt.key]: payload }));
          setIsLoadingOptions((prev) => ({ ...prev, [opt.key]: false }));
        }, 600);
      }
    });
  }, [options, loadedOptions, isLoadingOptions]);

  // Check how many filters are currently filled / active
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
      case 'number':
        return (
          <div key={opt.key} className="flex flex-col gap-1 w-full min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{opt.label}</label>
            <Input
              type="number"
              placeholder={opt.placeholder ?? `Filter by ${opt.label}...`}
              value={value}
              onChange={(e) => onFilterChange(opt.key, e.target.value)}
              className="bg-white border-slate-200"
            />
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
                  className={`w-full justify-start text-left font-normal h-9 bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-60 text-slate-600" />
                  <span className="truncate">{formatDateLabel(currentDate)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="left">
                <Calendar
                  selected={currentDate}
                  onSelect={(date) => {
                    onFilterChange(opt.key, date);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

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
                ) : (
                  <SelectValue placeholder={opt.placeholder ?? `All ${opt.label}s`} />
                )}
              </SelectTrigger>
              <SelectContent>
                {/* Reset dropdown item */}
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
      {/* Mobile-Only Header Accordion Row */}
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
            {isMobileOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop View Content Panel OR Active Mobile Content Panel */}
      <div
        className={`${
          isMobileOpen ? 'block mt-3 border-t border-slate-200/80 pt-3' : 'hidden'
        } md:block space-y-4 animate-in fade-in duration-200`}
      >
        <div className={`grid gap-4 items-end ${
          filterslot === 1 ? 'grid-cols-1' :
          filterslot === 2 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' :
          filterslot === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          filterslot === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          filterslot === 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5' :
          filterslot === 6 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {options.map((opt) => renderField(opt))}

          {/* Action Row - Desktop-only clear button (only holds space or wraps nicely) */}
          <div className={`hidden md:flex justify-end pb-0.5 ${
            filterslot === 1 ? 'col-span-1' :
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
