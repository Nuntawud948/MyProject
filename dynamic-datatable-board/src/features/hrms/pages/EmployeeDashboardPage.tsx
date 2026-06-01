/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Briefcase,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { DataTable, FilterableColumnDef } from '@/components/shared/data-table/DataTable';
import { FilterOption } from '@/components/shared/data-table/DataFilterBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { employee, HRMSQueryParams } from '@/api/hrms/employee';

import { PaginatedDto } from '@/dto/common/paginated-dto';

// 🌟 ปรับปรุงอินเตอร์เฟสให้ตรงตามโครงสร้างตารางและ DTO ตัวจริงหลังบ้าน
export interface Employee {
  id: string;
  code: string;
  fullName: string;
  department: string;
  startDate: Date;
  isActive: boolean;        // 👈 เปลี่ยนเป็น boolean ตรงตามเบสจริง
  phoneNumber?: string;     // 👈 เพิ่มเข้ามารองรับตารางใหม่
  resignationDate?: Date | null; // 👈 เพิ่มเข้ามารองรับตารางใหม่
}

// Define dynamic filter options matching components criteria
const FILTER_CONFIGURATION: FilterOption[] = [
  {
    key: 'code',            // 👈 เปลี่ยนจาก searchQuery เป็น code ยิงตรงเข้าพารามิเตอร์หลังบ้าน
    label: 'Employee Code',
    type: 'string',
    placeholder: 'Search employee code...'
  },
  {
    key: 'firstName',       // 👈 เพิ่มช่องกรองแยก FirstName ตามที่หลังบ้านแกะรับสายไว้
    label: 'First Name',
    type: 'string',
    placeholder: 'Search first name...'
  },
  {
    key: 'lastName',        // 👈 เพิ่มช่องกรองแยก LastName 
    label: 'Last Name',
    type: 'string',
    placeholder: 'Search last name...'
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
  }
];

export function EmployeeDashboardPage() {
  // 🌟 ปรับแต่ง Active Query request packet ให้ตรงล็อก EmployeeRequest.cs ของ C#
  const [queryParams, setQueryParams] = useState<HRMSQueryParams>({
    code: '',
    firstName: '',
    lastName: '',
    department: '',
    status: '', // ส่งเป็นข้อความสเตตัส หรือปรับตามกลไกคัดกรอง
    pageSize: 10,
    pageIndex: 0
  });

  // Presentation State indicators using standardized PaginatedDto
  const [paginatedData, setPaginatedData] = useState<PaginatedDto<Employee>>({
    items: [],
    totalCount: 0,
    pageSize: 10,
    pageIndex: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorState, setShowErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // States for row actions
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  // Tanstack Table structural column definitions
  const columns: FilterableColumnDef<Employee>[] = [
    {
      accessorKey: 'code',
      header: 'Employee Code',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50">
          {row.original.code}
        </span>
      )
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
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
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        // แสดงผล Badge ตามสถานะ Boolean จริงจาก PostgreSQL 
        return (
          <Badge variant={isActive ? 'success' : 'destructive'}>
            {isActive ? 'ทำงานอยู่' : 'ลาออกแล้ว'}
          </Badge>
        );
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
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeForDetail(emp);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeForEdit(emp);
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

  // 🚀 ดึงข้อมูลจาก C# .NET API พร้อมทำแบบแผน Mapping ลงล็อกตารางใหม่
  // 🚀 ดึงข้อมูลจาก C# .NET API พร้อมทำแบบแผน Mapping ลงล็อกตารางใหม่
  const fetchActiveDatabaseRecords = async () => {
    try {
      setIsLoading(true);
      setShowErrorState(false);

      // แปลงโครงสร้างจาก pageIndex (เริ่มจาก 0) เป็น pageNumber (เริ่มจาก 1) ยิงไปหาคอนโทรลเลอร์ C#
      const payload = {
        ...queryParams,
        pageNumber: queryParams.pageIndex + 1,
        pageSize: queryParams.pageSize
      };

      const response = await employee.getEmployees(payload);

      // ==========================================================
      // 🧠 🛠️ [FIX LAYER]: แก้ไขการเจาะเข้าเลเยอร์ซองข้อมูล Axios + Response Wrapper
      // ==========================================================
      // ส่องดูโครงสร้างจริง: response.data (ก้อนนอกสุด) -> .data (ห่อวัตถุหลักหลังบ้าน) -> .items
      const actualServerPayload = response.data?.data ? response.data.data : response.data;

      const rawItems = actualServerPayload?.items || [];
      const serverTotalCount = actualServerPayload?.totalRecords || 0;

      // Mapping ฟิลด์จาก PascalCase ให้เข้ากับไทป์ UI หน้าบ้าน
      const mappedEmployees: Employee[] = rawItems.map((item: any) => ({
        id: (item.id || item.Id || '').toString(),
        code: item.code || item.Code || '',
        // 🌟 ซ่อมแซมกรณีดึง fullName ออกมาแล้วเป็น null ให้ทำการประกอบ FirstName + LastName สดหน้างาน
        fullName: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'No Name',
        department: item.department || item.Department || '-',
        startDate: item.startDate ? new Date(item.startDate) : new Date(),
        isActive: item.isActive !== undefined ? item.isActive : true,
        phoneNumber: item.phoneNumber || item.PhoneNumber || '-',
        resignationDate: item.resignationDate ? new Date(item.resignationDate) : null
      }));

      setPaginatedData({
        items: mappedEmployees,
        totalCount: serverTotalCount,
        pageSize: queryParams.pageSize,
        pageIndex: queryParams.pageIndex
      });
    } catch (error: any) {
      console.error("Database connection failure:", error);
      setErrorMessage(error.message || 'An unexpected error occurred while communicating with the C# .NET Core cluster.');
      setShowErrorState(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDatabaseRecords();
  }, [queryParams]);

  const handleFilterChange = (key: string, value: any) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value,
      pageIndex: 0 // บังคับคืนหน้าแรกเสมอเวลากดกรองค้นหาตัวแปรใหม่
    }));
  };

  const handleClearFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      code: '',
      firstName: '',
      lastName: '',
      department: '',
      status: '',
      pageIndex: 0
    }));
  };

  // คำนวณ Metric Card แบบเซฟโซน
  const visibleCount = paginatedData.items.length;
  const activeCount = paginatedData.items.filter((e) => e.isActive === true).length;
  const activePercentage = visibleCount > 0 ? Math.round((activeCount / visibleCount) * 100) : 0;

  // คำนวณสถิติเด็กใหม่โดยเทียบเวลาแบบ Dynamic (ทำงานน้อยกว่า 365 วันนับจากวันเริ่มงาน)
  const currentYearTime = new Date().getTime();
  const newHiresCount = paginatedData.items.filter((e) => {
    const diffTime = Math.abs(currentYearTime - e.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 365;
  }).length;

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
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-700 shrink-0 shadow-3xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total in Page</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {visibleCount} <span className="text-xs text-slate-400 font-normal">rows</span>
            </h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 shadow-3xs">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Page Active Ratio</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {activeCount} <span className="text-xs text-emerald-600 font-bold">({activePercentage}%)</span>
            </h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0 shadow-3xs">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database Total</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {paginatedData.totalCount} <span className="text-xs text-amber-600 font-bold">records</span>
            </h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 shadow-3xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Junior Staff (Page)</p>
            <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mt-1">
              {newHiresCount} <span className="text-xs text-blue-600 font-normal">staff</span>
            </h4>
          </div>
        </Card>
      </div>

      {/* Integrated Unified SQL API State Display Badge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 text-slate-300 p-3 px-4.5 rounded-lg border border-slate-800 shadow-xs font-mono text-[10px] md:text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          <span>
            <strong className="text-emerald-400 uppercase">C# API ROUTE PAYLOAD:</strong>{' '}
            {`/api/employees?code=${queryParams.code}&firstName=${queryParams.firstName}&lastName=${queryParams.lastName}&department=${queryParams.department}`}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 border border-slate-800 px-2 py-0.5 rounded bg-slate-950 font-bold">
          Entity Framework 10
        </div>
      </div>

      {/* Global generic DataTable Instance */}
      <DataTable
        columns={columns}
        paginatedData={paginatedData}
        filterOptions={FILTER_CONFIGURATION}
        filters={queryParams}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterslot={4}
        onPageChange={(index) => {
          setQueryParams((prev) => ({ ...prev, pageIndex: index }));
        }}
        onPageSizeChange={(size) => {
          setQueryParams((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }));
        }}
        isLoading={isLoading}
        error={showErrorState ? errorMessage : null}
        onRetry={() => {
          fetchActiveDatabaseRecords();
        }}
      />

      {/* DETAIL VIEW MODAL */}
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
                {/* 🌟 แสดงวันลาออกเพิ่มเติมหากมีข้อมูลพนักงานที่ลาออกแล้ว */}
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