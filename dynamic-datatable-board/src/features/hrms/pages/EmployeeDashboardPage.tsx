/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Users,
  CalendarCheck,
  Briefcase,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { DataTable, DataTableColumnDef, TableQueryParams } from '@/components/shared/data-table/DataTable';
import { FilterOption } from '@/components/shared/data-table/DataFilterBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { employee } from '@/api/hrms/employee';
import { CustomCard } from '@/components/custom/CustomCard';

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  department: string;
  startDate: Date;
  isActive: boolean;
  phoneNumber?: string;
  resignationDate?: Date | null;
}

export function EmployeeDashboardPage() {
  // States for row actions and KPI metrics
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  // Stats purely for rendering the KPI metric cards at the top
  const [pageStats, setPageStats] = useState({ visibleCount: 0, activeCount: 0, newHiresCount: 0, totalCount: 0 });

  // Tanstack Table structural column definitions WITH embedded filters
  const columns: DataTableColumnDef<Employee>[] = [
    {
      accessorKey: 'code',
      header: 'Employee Code',
      isGlobalFilter: true, // Adds to top DataFilterBar
      filterType: 'string',
      filterPlaceholder: 'Search code...',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50">
          {row.original.code}
        </span>
      )
    },
    {
      accessorKey: 'fullName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold text-xs select-none">
            {row.original.fullName ? row.original.fullName.split(' ').map((n) => n[0]).join('') : 'EM'}
          </div>
          <span className="font-semibold text-slate-900">{row.original.fullName}</span>
        </div>
      )
    },
    {
      accessorKey: 'department',
      header: 'Department',
      isGlobalFilter: true, // Auto-generates dropdown filter
      filterType: 'select',
      filterPlaceholder: 'All Departments',
      filterApiEndpoint: '/api/departments',
      filterTextProperty: 'deptTitle',
      filterValueProperty: 'deptId',
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium">{row.original.department}</span>
      )
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
      cell: ({ row }) => (
        <span className="text-slate-500 font-mono">{row.original.phoneNumber || '-'}</span>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',

      cell: ({ row }) => {
        const val = row.original.startDate;
        return (
          <span className="text-slate-500 font-medium">
            {val instanceof Date && !isNaN(val.getTime())
              ? val.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'N/A'}
          </span>
        );
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
          {row.original.isActive ? 'ทำงานอยู่' : 'ลาออกแล้ว'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => {
        const emp = row.original;
        const isMenuOpen = activeRowMenuId === emp.id;
        return (
          <div className="relative text-left">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs font-bold text-lg select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRowMenuId(isMenuOpen ? null : emp.id);
              }}
            >
              ···
            </Button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveRowMenuId(null); }} />
                <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => { setSelectedEmployeeForDetail(emp); setActiveRowMenuId(null); }} className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors">
                    Detail
                  </button>
                  <button type="button" onClick={() => { setSelectedEmployeeForEdit(emp); setActiveRowMenuId(null); }} className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors">
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }
    }
  ];

  // 🚀 The Universal Fetch Bridge for DataTable
  const fetchEmployees = async (params: TableQueryParams) => {
    // 1. Map DataTable params to C# DTO directly
    const payload = {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      ...params.filters // Injects code, firstName, lastName, department etc.
    };

    const response = await employee.getEmployees(payload);
    const serverPayload = response.data?.data ? response.data.data : response.data;
    const rawItems = serverPayload?.items || [];

    // 2. Map payload back to Employee UI Interface
    const mappedItems: Employee[] = rawItems.map((item: any) => ({
      id: (item.id || item.Id || '').toString(),
      code: item.code || item.Code || '',
      fullName: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'No Name',
      department: item.department || item.Department || '-',
      startDate: item.startDate ? new Date(item.startDate) : new Date(),
      isActive: item.isActive !== undefined ? item.isActive : true,
      phoneNumber: item.phoneNumber || item.PhoneNumber || '-',
      resignationDate: item.resignationDate ? new Date(item.resignationDate) : null
    }));

    return {
      items: mappedItems,
      totalCount: serverPayload?.totalRecords || 0,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex
    };
  };

  // Callback to calculate KPI Metrics when DataTable finishes loading new data
  const handleDataLoaded = (items: Employee[], totalCount: number) => {
    const activeCount = items.filter((e) => e.isActive).length;
    const currentYearTime = new Date().getTime();
    const newHiresCount = items.filter((e) => {
      const diffTime = Math.abs(currentYearTime - e.startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 365;
    }).length;

    setPageStats({
      visibleCount: items.length,
      activeCount,
      newHiresCount,
      totalCount
    });
  };

  const activePercentage = pageStats.visibleCount > 0 ? Math.round((pageStats.activeCount / pageStats.visibleCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Employee Administration
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-normal max-w-xl">
            Control employee records, design filters dynamic, audit roles, and track active statuses synced directly against enterprise API logs.
          </p>
        </div>
      </div>

      {/* KPI Metric Bento Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomCard
          icon={<Users className="h-5 w-5" />}
          title="Total in Page"
          value={<>{pageStats.visibleCount} <span className="text-xs text-slate-400 font-normal">rows</span></>}
          iconBgClass="bg-slate-50 border-slate-100"
          iconTextClass="text-slate-700"
          gradientFrom="from-white"
          gradientTo="to-slate-50/50"
        />
        <CustomCard
          icon={<UserCheck className="h-5 w-5" />}
          title="Page Active Ratio"
          value={<>{pageStats.activeCount} <span className="text-xs text-emerald-600 font-bold">({activePercentage}%)</span></>}
          iconBgClass="bg-emerald-50 border-emerald-100"
          iconTextClass="text-emerald-600"
          gradientFrom="from-white"
          gradientTo="to-emerald-50/20"
        />
        <CustomCard
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Database Total"
          value={<>{pageStats.totalCount} <span className="text-xs text-amber-600 font-bold">records</span></>}
          iconBgClass="bg-amber-50 border-amber-100"
          iconTextClass="text-amber-600"
          gradientFrom="from-white"
          gradientTo="to-amber-50/20"
        />
        <CustomCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Junior Staff (Page)"
          value={<>{pageStats.newHiresCount} <span className="text-xs text-blue-600 font-normal">staff</span></>}
          iconBgClass="bg-blue-50 border-blue-100"
          iconTextClass="text-blue-600"
          gradientFrom="from-white"
          gradientTo="to-blue-50/20"
        />
      </div>

      {/* Global generic DataTable Instance */}
      <DataTable
        columns={columns}
        fetchData={fetchEmployees}
        onDataLoaded={handleDataLoaded}
        filterslot={4}
        // extraFilterOptions are filters we want in the UI bar, but don't correspond to visual columns
        extraFilterOptions={[
          { key: 'firstName', label: 'First Name', type: 'string', placeholder: 'Search first name...' },
          { key: 'lastName', label: 'Last Name', type: 'string', placeholder: 'Search last name...' }
        ]}
      />

      {/* DETAIL VIEW MODAL - Unchanged */}
      {selectedEmployeeForDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-100">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden text-left animate-in zoom-in-95 duration-150 m-4">
            <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                <span>Employee Registry File</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForDetail(null)}
                className="h-7 w-7 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg">
                  {selectedEmployeeForDetail.fullName ? selectedEmployeeForDetail.fullName.split(' ').map((n) => n[0]).join('') : 'EM'}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {selectedEmployeeForDetail.fullName}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono font-bold mt-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-205 inline-block">
                    {selectedEmployeeForDetail.code}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Department</span>
                  <p className="text-slate-800 text-xs mt-0.5">{selectedEmployeeForDetail.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Phone Number</span>
                  <p className="text-slate-800 font-mono text-xs mt-0.5">{selectedEmployeeForDetail.phoneNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Start Date</span>
                  <p className="text-slate-800 text-xs mt-0.5">
                    {selectedEmployeeForDetail.startDate instanceof Date && !isNaN(selectedEmployeeForDetail.startDate.getTime())
                      ? selectedEmployeeForDetail.startDate.toLocaleDateString('th-TH', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Status</span>
                  <div className="mt-1">
                    <Badge variant={selectedEmployeeForDetail.isActive ? 'success' : 'destructive'}>
                      {selectedEmployeeForDetail.isActive ? 'ทำงานอยู่' : 'ลาออกแล้ว'}
                    </Badge>
                  </div>
                </div>
                {!selectedEmployeeForDetail.isActive && selectedEmployeeForDetail.resignationDate && (
                  <div className="col-span-2 pt-2 border-t border-slate-50">
                    <span className="text-red-400 uppercase font-extrabold text-[10px]">Resignation Date</span>
                    <p className="text-red-600 text-xs mt-0.5">
                      {selectedEmployeeForDetail.resignationDate.toLocaleDateString('th-TH', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button
                onClick={() => setSelectedEmployeeForDetail(null)}
                className="text-xs font-bold px-4 py-2 bg-slate-900 border border-transparent text-white rounded-md hover:bg-slate-800 transition cursor-pointer"
              >
                Close Registry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}