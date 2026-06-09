import { useState } from 'react';
import {
  CalendarDays,
  CalendarCheck,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { DataTable, DataTableColumnDef, TableQueryParams } from '@/components/shared/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { companyHoliday } from '@/api/hrms/companyHoliday';
import { CustomCard } from '@/components/custom/CustomCard';
import { CustomButton } from '@/components/custom/CustomButton';
import { CompanyHolidayFormModal } from './companyHolidays/CompanyHolidayFormModal';
import { CompanyHolidayResponse } from '@/dto/hrms/companyHoliday';

export function CompanyHolidayDashboardPage() {
  const [activeRowMenuId, setActiveRowMenuId] = useState<number | null>(null);

  // Dialog/Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedHoliday, setSelectedHoliday] = useState<CompanyHolidayResponse | null>(null);

  // Reload counter to force table re-fetch
  const [refreshCounter, setRefreshCounter] = useState(0);

  const columns: DataTableColumnDef<CompanyHolidayResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Holiday Name',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'string',
      filterPlaceholder: 'Search name...',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'holidayDate',
      header: 'Holiday Date',
      cell: ({ row }) => {
        const val = row.original.holidayDate;
        return (
          <span className="text-slate-650 font-mono">
            {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
          </span>
        );
      }
    },
    {
      accessorKey: 'year',
      header: 'Year',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'string',
      filterPlaceholder: 'Year (e.g. 2026)',
      cell: ({ row }) => (
        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
          {row.original.year}
        </span>
      )
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs italic">{row.original.description || '-'}</span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => {
        const item = row.original;
        const isMenuOpen = activeRowMenuId === item.id;
        return (
          <div className="relative text-left">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-xs font-bold text-lg select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRowMenuId(isMenuOpen ? null : item.id);
              }}
            >
              ···
            </Button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveRowMenuId(null); }} />
                <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHoliday(item);
                      setDialogMode('view');
                      setIsDialogOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHoliday(item);
                      setDialogMode('edit');
                      setIsDialogOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this holiday?')) {
                        await companyHoliday.delete(item.id);
                        setRefreshCounter((prev) => prev + 1);
                      }
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-650 hover:bg-red-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const fetchHolidays = async (params: TableQueryParams) => {
    const payload = {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      ...params.filters
    };

    const response = await companyHoliday.getCompanyHolidays(payload);
    const serverPayload = response.data;
    const rawItems = serverPayload?.items || [];

    const mappedItems: CompanyHolidayResponse[] = rawItems.map((item: any) => ({
      id: item.id || item.Id,
      name: item.name || item.Name || '',
      holidayDate: item.holidayDate || item.HolidayDate || '',
      description: item.description || item.Description || '',
      year: item.year || item.Year || new Date().getFullYear(),
      isActive: item.isActive !== false,
    }));

    return {
      items: mappedItems,
      totalCount: serverPayload?.totalCount || 0,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex
    };
  };

  const handleSaveHoliday = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Company Holiday Management
          </h2>
        </div>
      </div>

      <CustomButton
        variant="primary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => {
          setSelectedHoliday(null);
          setDialogMode('create');
          setIsDialogOpen(true);
        }}
      >
        Add Holiday
      </CustomButton>

      {/* KPI Bento Box Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="Current Year"
          value={<>{new Date().getFullYear()} <span className="text-xs text-slate-400 font-normal">active year</span></>}
          iconBgClass="bg-slate-50 border-slate-100"
          iconTextClass="text-slate-700"
          gradientFrom="from-white"
          gradientTo="to-slate-50/50"
        />
        <CustomCard
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Holiday Type"
          value={<>Official <span className="text-xs text-emerald-600 font-bold">regulated</span></>}
          iconBgClass="bg-emerald-50 border-emerald-100"
          iconTextClass="text-emerald-600"
          gradientFrom="from-white"
          gradientTo="to-emerald-50/20"
        />
        <CustomCard
          icon={<ShieldAlert className="h-5 w-5" />}
          title="HR Compliance"
          value={<>Configured <span className="text-xs text-blue-650 font-normal">active</span></>}
          iconBgClass="bg-blue-50 border-blue-100"
          iconTextClass="text-blue-650"
          gradientFrom="from-white"
          gradientTo="to-blue-50/20"
        />
      </div>

      <DataTable
        key={refreshCounter}
        columns={columns}
        fetchData={fetchHolidays}
        filterslot={3}
        filterableActive={true}
      />

      <CompanyHolidayFormModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        holidayData={selectedHoliday}
        onSave={handleSaveHoliday}
      />
    </div>
  );
}
