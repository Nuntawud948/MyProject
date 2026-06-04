/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Briefcase,
  UserCheck,
  Plus
} from 'lucide-react';
import { DataTable, DataTableColumnDef, TableQueryParams } from '@/components/shared/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { employee } from '@/api/hrms/employee';
import { CustomCard } from '@/components/custom/CustomCard';
import { CustomButton } from '@/components/custom/CustomButton';
import { EmployeeCreateViewUpdatePage } from './employees/EmployeeCreateViewUpdatePage';

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  departmentName: string;
  startDate: Date;
  isActive: boolean;
  phoneNumber?: string;
  resignationDate?: Date | null;
  employmentType?: string;
  salary?: number;
  departmentId?: string;
  roleName?: string;
}

export function EmployeeDashboardPage() {
  // States for row actions and KPI metrics
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

  // Dialog/Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Reload counter to force table re-fetch
  const [refreshCounter, setRefreshCounter] = useState(0);



  // Global DB-wide statistics
  const [globalStats, setGlobalStats] = useState({ totalCount: 0, activeCount: 0, newHiresCount: 0 });

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const response = await employee.getEmployeeStats();
        const payload = response.data?.data ? response.data.data : response.data;
        if (payload) {
          setGlobalStats({
            totalCount: payload.totalCount || 0,
            activeCount: payload.activeCount || 0,
            newHiresCount: payload.newHiresCount || 0
          });
        }
      } catch (error) {
        console.error('Failed to load global employee stats:', error);
      }
    };
    fetchGlobalStats();
  }, [refreshCounter]);

  const columns: DataTableColumnDef<Employee>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'string',
      filterPlaceholder: 'Search code...',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-150 px-2.5 py-1 rounded-md border border-slate-200/50">
          {row.original.code}
        </span>
      )
    },
    {
      accessorKey: 'fullName',
      header: 'Name',
      filterablebar: true,
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
      accessorKey: 'departmentName',
      header: 'Department',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'select',
      filterPlaceholder: 'All Departments',
      filterApiEndpoint: 'api/Departments/dropdown',
      filterTextProperty: 'name',
      filterValueProperty: 'id',
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium">{row.original.departmentName}</span>
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
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployee(emp);
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
                      setSelectedEmployee(emp);
                      setDialogMode('edit');
                      setIsDialogOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
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
    const payload: any = {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      ...params.filters // Injects code, firstName, lastName, department etc.
    };

    // If departmentId is entered as text (non-numeric), map to department name parameter
    if (payload.departmentId) {
      if (isNaN(Number(payload.departmentId))) {
        payload.department = payload.departmentId;
        delete payload.departmentId;
      }
    }

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
      resignationDate: item.resignationDate ? new Date(item.resignationDate) : null,
      employmentType: item.employmentType || 'Full-time',
      salary: item.salary || 0,
      departmentId: (item.departmentId || item.DepartmentId || '').toString(),
      roleId: (item.roleId || item.RoleId || '').toString(),
    }));

    return {
      items: mappedItems,
      totalCount: serverPayload?.totalRecords || 0,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex
    };
  };



  // Handles Dialog Submission (Create/Update)
  const handleSaveEmployee = async (formData: any) => {
    const payload = {
      ...formData,
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      roleId: formData.roleId ? Number(formData.roleId) : null,
      firstApproverId: formData.firstApproverId ? Number(formData.firstApproverId) : null,
      secondApproverId: formData.secondApproverId ? Number(formData.secondApproverId) : null,
      salary: formData.salary ? Number(formData.salary.replace(/,/g, '')) : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    if (formData.id) {
      await employee.updateEmployee(formData.id, payload);
    } else {
      await employee.createEmployee(payload);
    }

    // Force data table refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const activePercentage = globalStats.totalCount > 0 ? Math.round((globalStats.activeCount / globalStats.totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Employee
          </h2>
        </div>
      </div>
      <CustomButton
        variant="primary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => {
          setSelectedEmployee(null);
          setDialogMode('create');
          setIsDialogOpen(true);
        }}
      >
        Add Employee
      </CustomButton>
      {/* KPI Metric Bento Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomCard
          icon={<Users className="h-5 w-5" />}
          title="Total Employees"
          value={<>{globalStats.totalCount} <span className="text-xs text-slate-400 font-normal">records</span></>}
          iconBgClass="bg-slate-50 border-slate-100"
          iconTextClass="text-slate-700"
          gradientFrom="from-white"
          gradientTo="to-slate-50/50"
        />
        <CustomCard
          icon={<UserCheck className="h-5 w-5" />}
          title="Active Employees"
          value={<>{globalStats.activeCount} <span className="text-xs text-slate-400 font-normal">active</span></>}
          iconBgClass="bg-emerald-50 border-emerald-100"
          iconTextClass="text-emerald-600"
          gradientFrom="from-white"
          gradientTo="to-emerald-50/20"
        />
        <CustomCard
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Active Ratio"
          value={<>{activePercentage}% <span className="text-xs text-amber-600 font-bold">ratio</span></>}
          iconBgClass="bg-amber-50 border-amber-100"
          iconTextClass="text-amber-600"
          gradientFrom="from-white"
          gradientTo="to-amber-50/20"
        />
        <CustomCard
          icon={<Briefcase className="h-5 w-5" />}
          title="newHiresCount"
          value={<>{globalStats.newHiresCount} <span className="text-xs text-blue-600 font-normal">staff</span></>}
          iconBgClass="bg-blue-50 border-blue-100"
          iconTextClass="text-blue-600"
          gradientFrom="from-white"
          gradientTo="to-blue-50/20"
        />
      </div>

      <DataTable
        key={refreshCounter}
        columns={columns}
        fetchData={fetchEmployees}
        filterslot={4}
        filterableActive={true}
        // extraFilterOptions are filters we want in the UI bar, but don't correspond to visual columns
        extraFilterOptions={[
          { key: 'firstName', label: 'First Name', type: 'string', placeholder: 'Search first name...' },
          { key: 'lastName', label: 'Last Name', type: 'string', placeholder: 'Search last name...' }
        ]}
      />

      {/* CREATE / VIEW / EDIT MODAL DIALOG */}
      <EmployeeCreateViewUpdatePage
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        employeeData={selectedEmployee}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}