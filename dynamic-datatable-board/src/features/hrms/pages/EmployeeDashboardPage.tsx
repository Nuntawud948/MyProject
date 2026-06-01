/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  Briefcase,
  Plus,
  FileCheck,
  AlertOctagon,
  RefreshCw,
  SlidersHorizontal,
  FolderDown,
  UserCheck
} from 'lucide-react';
import { DataTable, FilterableColumnDef } from '@/components/shared/data-table/DataTable';
import { FilterOption } from '@/components/shared/data-table/DataFilterBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Employee Interface matching the HRMS schema
export interface Employee {
  id: string;
  code: string;
  fullName: string;
  department: string;
  startDate: Date;
  status: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  yearsOfService: number;
}

// Unified query state structure corresponding directly to C# .NET API query packets
export interface HRMSQueryParams {
  searchQuery: string;
  department: string;
  minServiceYears: number | '';
  startDateThreshold: Date | null;
  pageSize: number;
  pageIndex: number;
}

// Define dynamic filter options matching components criteria
const FILTER_CONFIGURATION: FilterOption[] = [
  {
    key: 'searchQuery',
    label: 'Employee Search',
    type: 'string',
    placeholder: 'Search name, code...'
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    placeholder: 'All Departments',
    apiEndpoint: '/api/departments',
    textProperty: 'deptTitle',
    valueProperty: 'deptId',
    filterable: true
  },
  {
    key: 'minServiceYears',
    label: 'Years of Service',
    type: 'number',
    placeholder: 'Min experience years'
  },
  {
    key: 'startDateThreshold',
    label: 'Start Date (From)',
    type: 'datetime',
    placeholder: 'Pick reference start date'
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', code: 'EMP-001', fullName: 'Alexander Wright', department: 'Engineering', startDate: new Date('2021-03-12'), status: 'Active', yearsOfService: 5 },
  { id: '2', code: 'EMP-014', fullName: 'Samantha Miller', department: 'Product Management', startDate: new Date('2023-01-20'), status: 'Active', yearsOfService: 3 },
  { id: '3', code: 'EMP-112', fullName: 'Michael Chen', department: 'Engineering', startDate: new Date('2022-11-05'), status: 'Active', yearsOfService: 4 },
  { id: '4', code: 'EMP-089', fullName: 'Sofia Brooks', department: 'Marketing', startDate: new Date('2024-05-15'), status: 'On Leave', yearsOfService: 2 },
  { id: '5', code: 'EMP-102', fullName: 'David Patel', department: 'Sales & Growth', startDate: new Date('2020-08-14'), status: 'Active', yearsOfService: 6 },
  { id: '6', code: 'EMP-155', fullName: 'Emily Jackson', department: 'Human Resources', startDate: new Date('2025-01-10'), status: 'Active', yearsOfService: 1 },
  { id: '7', code: 'EMP-023', fullName: 'Daniel Ramirez', department: 'Engineering', startDate: new Date('2021-06-30'), status: 'Inactive', yearsOfService: 5 },
  { id: '8', code: 'EMP-204', fullName: 'Chloe Bennett', department: 'Creative & Design', startDate: new Date('2023-09-01'), status: 'Active', yearsOfService: 3 },
  { id: '9', code: 'EMP-005', fullName: 'William Vance', department: 'Engineering', startDate: new Date('2019-11-22'), status: 'Active', yearsOfService: 7 },
  { id: '10', code: 'EMP-056', fullName: 'Isabella Ross', department: 'Finance', startDate: new Date('2022-04-18'), status: 'On Leave', yearsOfService: 4 },
  { id: '11', code: 'EMP-118', fullName: 'Tyler Harrison', department: 'Engineering', startDate: new Date('2024-02-14'), status: 'Active', yearsOfService: 2 },
  { id: '12', code: 'EMP-076', fullName: 'Victoria Sterling', department: 'Product Management', startDate: new Date('2020-03-05'), status: 'Active', yearsOfService: 6 },
  { id: '13', code: 'EMP-188', fullName: 'Logan Murphy', department: 'Sales & Growth', startDate: new Date('2025-04-01'), status: 'Active', yearsOfService: 1 },
  { id: '14', code: 'EMP-034', fullName: 'Grace Lin', department: 'Marketing', startDate: new Date('2021-10-12'), status: 'Terminated', yearsOfService: 5 },
  { id: '15', code: 'EMP-140', fullName: 'Marcus Vance', department: 'Engineering', startDate: new Date('2023-05-18'), status: 'Active', yearsOfService: 3 },
  { id: '16', code: 'EMP-092', fullName: 'Hannah Abbott', department: 'Finance', startDate: new Date('2024-07-25'), status: 'Active', yearsOfService: 2 },
  { id: '17', code: 'EMP-022', fullName: 'Oliver Martinez', department: 'Creative & Design', startDate: new Date('2022-02-10'), status: 'Inactive', yearsOfService: 4 }
];

export function EmployeeDashboardPage() {
  // Master Employee Registry (React state to allow adding/deleting elements dynamically)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // Active Query request packet matching a database payload request state
  const [queryParams, setQueryParams] = useState<HRMSQueryParams>({
    searchQuery: '',
    department: '',
    minServiceYears: '',
    startDateThreshold: null,
    pageSize: 10,
    pageIndex: 0
  });

  // Presentation State indicators
  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrorSimulated, setApiErrorSimulated] = useState(false);
  const [showErrorState, setShowErrorState] = useState(false);

  // States for row actions (...)
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  // Tanstack Table structural column definitions
  const columns: FilterableColumnDef<Employee>[] = [
    {
      accessorKey: 'code',
      header: 'Employee Code',
      filterable: false,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50">
          {row.original.code}
        </span>
      )
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      filterable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold text-xs select-none">
            {row.original.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="font-semibold text-slate-900">{row.original.fullName}</span>
        </div>
      )
    },
    {
      accessorKey: 'department',
      header: 'Department',
      filterable: true,
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium">{row.original.department}</span>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        const val = row.original.startDate;
        return (
          <span className="text-slate-500 font-medium">
            {val.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        );
      }
    },
    {
      accessorKey: 'yearsOfService',
      header: 'Service Years',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-slate-600">{row.original.yearsOfService} yrs</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status Badge',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap = {
          Active: 'success' as const,
          'On Leave': 'warning' as const,
          Inactive: 'secondary' as const,
          Terminated: 'destructive' as const,
        };
        return <Badge variant={colorMap[status]}>{status}</Badge>;
      }
    },
    {
      id: 'actions',
      header: 'Actions',
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
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveRowMenuId(null);
                  }}
                />
                <div 
                  className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setSelectedEmployeeForDetail(emp);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmployeeForEdit(emp);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${emp.fullName}?`)) {
                        setEmployees(prev => prev.filter(e => e.id !== emp.id));
                      }
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-black flex items-center gap-2 cursor-pointer transition-colors"
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

  // Handler for individual filter input changes which resets pages and updates request packet state
  const handleFilterChange = (key: string, value: any) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value,
      pageIndex: 0 // Reset pagination back to page 0 upon query mutations
    }));
  };

  // Handler for clearing all filters to baseline states
  const handleClearFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      searchQuery: '',
      department: '',
      minServiceYears: '',
      startDateThreshold: null,
      pageIndex: 0
    }));
  };

  // Handler for creating a mock employee dynamically
  const handleAddMockEmployee = () => {
    const names = [
      'Lucas Vance',
      'Maya Fletcher',
      'Gabriel Stone',
      'Zoe Albright',
      'Nathan Reyes',
      'Phoebe Lindon'
    ];
    const depts = [
      'Engineering',
      'Product Management',
      'Human Resources',
      'Sales & Growth',
      'Creative & Design'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDept = depts[Math.floor(Math.random() * depts.length)];
    const randomCodeInt = 200 + Math.floor(Math.random() * 800);
    const newEmp: Employee = {
      id: String(employees.length + 1),
      code: `EMP-${randomCodeInt}`,
      fullName: randomName,
      department: randomDept,
      startDate: new Date(),
      status: 'Active',
      yearsOfService: 1 + Math.floor(Math.random() * 5)
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  // Core query synchronization processor that calculates client database filtering, mimicking a C# .NET Entity Framework service call
  const executeQueryService = () => {
    if (showErrorState) return;

    setIsLoading(true);

    // SetTimeout simulation to show beautiful skeletons transition state
    setTimeout(() => {
      let result = [...employees];

      // 1. Text Query matches string type
      if (queryParams.searchQuery) {
        const search = queryParams.searchQuery.toLowerCase();
        result = result.filter(
          (emp) =>
            emp.fullName.toLowerCase().includes(search) ||
            emp.code.toLowerCase().includes(search)
        );
      }

      // 2. Department matches select dropdown type
      if (queryParams.department) {
        result = result.filter((emp) => emp.department === queryParams.department);
      }

      // 3. Service Years matches number type (greater than equal)
      if (queryParams.minServiceYears !== '') {
        const minVal = Number(queryParams.minServiceYears);
        result = result.filter((emp) => emp.yearsOfService >= minVal);
      }

      // 4. Start Date Threshold matches datetime picker
      if (queryParams.startDateThreshold) {
        const compareDate = new Date(queryParams.startDateThreshold);
        result = result.filter((emp) => emp.startDate.getTime() >= compareDate.getTime());
      }

      // Calculate total records BEFORE pagination chunking
      const computedTotal = result.length;

      // Apply pagination chunk logic (Slice calculation)
      const startIdx = queryParams.pageIndex * queryParams.pageSize;
      const paginatedChunk = result.slice(startIdx, startIdx + queryParams.pageSize);

      setFilteredData(paginatedChunk);
      setTotalCount(computedTotal);
      setIsLoading(false);
    }, 700);
  };

  // Run synchronization queries whenever core queryParams or employees collection updates
  useEffect(() => {
    executeQueryService();
  }, [queryParams, employees, showErrorState]);

  // Handle manual API Simulation trigger changes
  useEffect(() => {
    if (apiErrorSimulated) {
      setShowErrorState(true);
    } else {
      setShowErrorState(false);
    }
  }, [apiErrorSimulated]);

  // Compute metric numbers
  const totalEmployeesCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const leaveCount = employees.filter((e) => e.status === 'On Leave').length;
  const newHiresCount = employees.filter((e) => e.yearsOfService === 1).length;

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

        {/* Dynamic simulation toggle and New employee creation button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Simulate C# failure switcher */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-3xs px-3.5 py-1.5 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiErrorSimulated ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiErrorSimulated ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            </span>
            <label className="text-[11px] font-bold text-slate-650 cursor-pointer select-none">
              Simulate Dev Server Error
              <input
                type="checkbox"
                checked={apiErrorSimulated}
                onChange={(e) => setApiErrorSimulated(e.target.checked)}
                className="ml-2 h-3.5 w-3.5 align-middle rounded-sm accent-slate-900 border-slate-300"
              />
            </label>
          </div>

          <Button
            onClick={handleAddMockEmployee}
            disabled={isLoading || showErrorState}
            className="text-xs font-bold gap-1.5 h-9 bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Mock Member
          </Button>
        </div>
      </div>

      {/* KPI Metric Bento Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card A: Total employees */}
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-700 shrink-0 shadow-3xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Headcount</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {totalEmployeesCount} <span className="text-xs text-slate-400 font-normal">staff</span>
            </h4>
          </div>
        </Card>

        {/* Metric Card B: Active members */}
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 shadow-3xs">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Status ratio</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {activeCount} <span className="text-xs text-emerald-600 font-bold">({Math.round((activeCount/totalEmployeesCount)*100)}%)</span>
            </h4>
          </div>
        </Card>

        {/* Metric Card C: On leave */}
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0 shadow-3xs">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">On Leave Today</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {leaveCount} <span className="text-xs text-amber-600 font-bold">staff</span>
            </h4>
          </div>
        </Card>

        {/* Metric Card D: New hires */}
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 shadow-3xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">1st Year Graduates</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {newHiresCount} <span className="text-xs text-blue-600 font-normal">hires</span>
            </h4>
          </div>
        </Card>
      </div>

      {/* Integrated Unified SQL API State Display Badge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 text-slate-300 p-3 px-4.5 rounded-lg border border-slate-800 shadow-xs font-mono text-[10px] md:text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>
            <strong className="text-emerald-400 uppercase">C# Query payload:</strong>{' '}
            {`$"{baseUrl}/api/employees?search=${queryParams.searchQuery}&dept=${queryParams.department}&minYears=${queryParams.minServiceYears}&skip=${queryParams.pageIndex * queryParams.pageSize}&take=${queryParams.pageSize}"`}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 border border-slate-800 px-2 py-0.5 rounded bg-slate-950 font-bold">
          Entity Framework 9
        </div>
      </div>

      {/* Global generic DataTable Instance */}
      <DataTable
        columns={columns}
        data={filteredData}
        filterOptions={FILTER_CONFIGURATION}
        filters={queryParams}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterslot={4}
        totalCount={totalCount}
        pageSize={queryParams.pageSize}
        pageIndex={queryParams.pageIndex}
        onPageChange={(index) => {
          setQueryParams((prev) => ({ ...prev, pageIndex: index }));
        }}
        onPageSizeChange={(size) => {
          setQueryParams((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }));
        }}
        isLoading={isLoading}
        error={showErrorState ? 'An unexpected database deadlock occurred. Connection timed out on SQL transaction loop.' : null}
        onRetry={() => {
          setApiErrorSimulated(false);
          setShowErrorState(false);
        }}
      />

      {/* DETAIL VIEW MODAL */}
      {selectedEmployeeForDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-100">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden text-left animate-in zoom-in-95 duration-150 m-4">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span>Employee Registry File</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForDetail(null)}
                className="h-7 w-7 rounded-md hover:bg-slate-205 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg">
                  {selectedEmployeeForDetail.fullName.split(' ').map((n) => n[0]).join('')}
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
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Years of Service</span>
                  <p className="text-slate-800 text-xs mt-0.5">{selectedEmployeeForDetail.yearsOfService} yrs</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Start Date</span>
                  <p className="text-slate-800 text-xs mt-0.5">
                    {selectedEmployeeForDetail.startDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-extrabold text-[10px]">Security Status</span>
                  <div className="mt-1">
                    <Badge variant={
                      selectedEmployeeForDetail.status === 'Active' ? 'success' :
                      selectedEmployeeForDetail.status === 'On Leave' ? 'warning' :
                      selectedEmployeeForDetail.status === 'Inactive' ? 'secondary' : 'destructive'
                    }>
                      {selectedEmployeeForDetail.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-101 rounded-lg p-3 text-[11px] text-slate-500 leading-normal">
                <p className="font-bold text-slate-700">Access Privileges Cache:</p>
                <p className="mt-1 font-medium">Role assignments and permissions check against the active RBAC eligibility matrix. This device credential complies with standard workspace auditing parameters.</p>
              </div>
            </div>

            {/* Modal Footer */}
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

      {/* EDIT FORM MODAL */}
      {selectedEmployeeForEdit && (
        <EditEmployeeFormModal
          employee={selectedEmployeeForEdit}
          onSave={(updatedEmployee) => {
            setEmployees((prev) =>
              prev.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e))
            );
            setSelectedEmployeeForEdit(null);
          }}
          onClose={() => setSelectedEmployeeForEdit(null)}
        />
      )}
    </div>
  );
}

interface EditEmployeeFormModalProps {
  employee: Employee;
  onSave: (emp: Employee) => void;
  onClose: () => void;
}

function EditEmployeeFormModal({ employee, onSave, onClose }: EditEmployeeFormModalProps) {
  const [fullName, setFullName] = useState(employee.fullName);
  const [department, setDepartment] = useState(employee.department);
  const [yearsOfService, setYearsOfService] = useState(employee.yearsOfService);
  const [status, setStatus] = useState(employee.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...employee,
      fullName,
      department,
      yearsOfService: Number(yearsOfService),
      status,
    });
  };

  const departments = [
    'Engineering',
    'Product Management',
    'Sales & Growth',
    'Marketing',
    'Creative & Design',
    'Human Resources',
    'Finance',
  ];

  const statuses = ['Active', 'On Leave', 'Inactive', 'Terminated'] as const;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-100">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden text-left animate-in zoom-in-95 duration-150 m-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Modify Employee Profile
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer font-bold text-sm"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Employee Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 hover:border-slate-350 focus:border-slate-800 rounded-md p-2.5 outline-none font-sans text-slate-800 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 focus:border-slate-800 rounded-md p-2.5 bg-white outline-none font-sans text-slate-800"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Experience (Years)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(Number(e.target.value))}
                  className="w-full text-xs font-bold border border-slate-200 focus:border-slate-800 rounded-md p-2.5 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs font-bold border border-slate-200 focus:border-slate-800 rounded-md p-2.5 bg-white outline-none font-sans text-slate-800"
                >
                  {statuses.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-right">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="text-xs font-bold px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-md cursor-pointer transition-colors"
            >
              Commit Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
