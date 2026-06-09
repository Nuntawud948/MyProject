import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface CustomDropdownProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options?: DropdownOption[]; // Optional if apiEndpoint is used
  apiEndpoint?: string; // e.g. 'api/Departments/dropdown'
  textProperty?: string; // e.g. 'name'
  valueProperty?: string; // e.g. 'id'
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function CustomDropdown({
  label,
  value,
  onChange,
  options: staticOptions,
  apiEndpoint,
  textProperty,
  valueProperty,
  placeholder = 'Select option...',
  error,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [apiOptions, setApiOptions] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cache of seen options (value -> label) to preserve selected label when filtering lists remotely
  const seenOptionsMap = useRef<Record<string, string>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Fetch API options when endpoint or search keyword updates
  useEffect(() => {
    if (apiEndpoint) {
      const fetchApiOptions = async () => {
        setIsLoading(true);
        try {
          const res = await axiosClient.get(apiEndpoint, {
            params: { search: searchText, pageSize: 500, pageNumber: 1 }
          });
          const serverItems = res.data?.data?.items || res.data?.items || res.data?.data || res.data || [];
          const mapped = serverItems.map((item: any) => {
            // Support both camelCase and PascalCase
            const val = valueProperty ? (item[valueProperty] ?? item[valueProperty.charAt(0).toUpperCase() + valueProperty.slice(1)]) : (item.id ?? item.Id ?? item.value);
            const lbl = textProperty ? (item[textProperty] ?? item[textProperty.charAt(0).toUpperCase() + textProperty.slice(1)]) : (item.name ?? item.Name ?? item.fullName ?? item.FullName ?? item.label ?? String(item));
            return {
              value: String(val),
              label: String(lbl)
            };
          });
          setApiOptions(mapped);

          // Cache labels
          mapped.forEach((opt: DropdownOption) => {
            seenOptionsMap.current[String(opt.value)] = opt.label;
          });
        } catch (err) {
          console.error(`Failed to load options from endpoint ${apiEndpoint}:`, err);
        } finally {
          setIsLoading(false);
        }
      };

      // Debounce remote API search queries
      const delayDebounce = setTimeout(() => {
        fetchApiOptions();
      }, searchText ? 300 : 0);

      return () => clearTimeout(delayDebounce);
    }
  }, [apiEndpoint, searchText, isOpen]);

  // Sync static options into cache if provided
  useEffect(() => {
    if (staticOptions) {
      staticOptions.forEach((opt) => {
        seenOptionsMap.current[String(opt.value)] = opt.label;
      });
    }
  }, [staticOptions]);

  const handleSelect = (val: string | number) => {
    onChange(String(val));
    setIsOpen(false);
  };

  const currentOptions = staticOptions || apiOptions;

  // Resolve displaying label
  const selectedOption = currentOptions.find((opt) => String(opt.value) === String(value));
  let displayLabel = placeholder;
  if (selectedOption) {
    displayLabel = selectedOption.label;
  } else if (value !== undefined && value !== null && value !== '' && seenOptionsMap.current[String(value)]) {
    displayLabel = seenOptionsMap.current[String(value)];
  }

  return (
    <div className="w-full flex flex-col gap-1.5 text-left relative" ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
          {label}
        </label>
      )}

      {/* Select Box Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-800 transition-all duration-200 outline-none flex items-center justify-between text-sm text-left select-none cursor-pointer disabled:opacity-75 disabled:pointer-events-none
          ${error ? 'border-red-400 focus:ring-4 focus:ring-red-100' : 'border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100'}
          ${isOpen ? 'border-slate-900 ring-4 ring-slate-100' : ''}`}
      >
        <span className={displayLabel !== placeholder ? 'text-slate-800' : 'text-slate-450 font-normal'}>
          {displayLabel}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Options Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 top-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in-50 slide-in-from-top-1 duration-150 max-h-60">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1.5" />
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-transparent border-none text-xs outline-none py-1.5 text-slate-800 placeholder:text-slate-400"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="h-5 w-5 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Option Items List */}
          <div className="flex-1 overflow-y-auto py-1 max-h-44">
            {isLoading ? (
              <div className="py-4 text-center text-xs text-slate-450 font-medium animate-pulse">
                Loading options...
              </div>
            ) : currentOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                No matching results
              </div>
            ) : (
              currentOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors duration-150
                      ${isSelected ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500 font-medium tracking-wide animate-in fade-in duration-200">
          {error}
        </span>
      )}
    </div>
  );
}
