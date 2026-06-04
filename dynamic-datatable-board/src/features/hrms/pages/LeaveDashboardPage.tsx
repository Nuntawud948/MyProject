import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Clock,
  UserCheck,
  Plus,
  Settings,
} from 'lucide-react';
import { DataTable, DataTableColumnDef, TableQueryParams } from '@/components/shared/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomCard } from '@/components/custom/CustomCard';
import { CustomButton } from '@/components/custom/CustomButton';

// API & Types
import { leave } from '@/api/hrms/leave';
import type { LeaveRequestDto } from '@/dto/hrms/leaveRequest';
import type { LeaveTypeDto } from '@/dto/hrms/leaveType';

// Modals
import { LeaveTypeFormModal } from './leaves/LeaveTypeFormModal';
import { LeaveRequestFormModal } from './leaves/LeaveRequestFormModal';
import { LeaveApprovalModal } from './leaves/LeaveApprovalModal';

export function LeaveDashboardPage() {
  const [activeTab, setActiveTab] = useState<'myLeaves' | 'approvals' | 'types'>('myLeaves');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | number | null>(null);

  // Stats State
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingApproval: 0,
    approvedRequests: 0,
    activeLeaveTypes: 0,
  });

  // Modal Control States
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeDto | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalMode, setRequestModalMode] = useState<'create' | 'view'>('create');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestDto | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalLevel, setApprovalLevel] = useState<'first' | 'second'>('first');

  // Load KPI stats on mount / table refresh
  useEffect(() => {
    const fetchKPIStats = async () => {
      try {
        const [reqsRes, typesRes] = await Promise.all([
          leave.getLeaveRequests({ pageIndex: 0, pageSize: 200 }),
          leave.getLeaveTypes({ pageIndex: 0, pageSize: 200 }),
        ]);

        const reqs = reqsRes.data?.data?.items || reqsRes.data?.items || [];
        const types = typesRes.data?.data?.items || typesRes.data?.items || [];

        setStats({
          totalRequests: reqs.length,
          pendingApproval: reqs.filter((r: any) => r.status === 'Pending').length,
          approvedRequests: reqs.filter((r: any) => r.status === 'Approved').length,
          activeLeaveTypes: types.filter((t: any) => t.isActive).length,
        });
      } catch (err) {
        console.error('Failed to load leave dashboard stats:', err);
      }
    };
    fetchKPIStats();
  }, [refreshCounter]);

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // ── DataTable configurations for Leave Types ───────────────────────────────────────
  const fetchLeaveTypes = async (params: TableQueryParams) => {
    try {
      const res = await leave.getLeaveTypes({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.filters?.search  || '',
      });
      const dataObj = res.data?.data || res.data;
      return {
        items: dataObj.items || [],
        totalCount: dataObj.totalCount || 0,
        pageSize: dataObj.pageSize || 10,
        pageIndex: (dataObj.pageIndex > 0 ? dataObj.pageIndex - 1 : 0),
      };
    } catch (error) {
      console.error(error);
      return { items: [], totalCount: 0, pageSize: 10, pageIndex: 0 };
    }
  };

  const leaveTypeColumns: DataTableColumnDef<LeaveTypeDto>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-slate-400 font-semibold">#{row.original.id}</span>
    },
    {
      accessorKey: 'name',
      header: 'Name',
      isGlobalFilter: true,
      cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.name}</span>
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-slate-500 text-xs line-clamp-1">{row.original.description || '-'}</span>
    },
    {
      accessorKey: 'maxDaysPerYear',
      header: 'Max Days / Year',
      cell: ({ row }) => <span className="font-semibold text-slate-700">{row.original.maxDaysPerYear} days</span>
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Disabled'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => {
        const item = row.original;
        const isMenuOpen = activeRowMenuId === `type-${item.id}`;
        return (
          <div className="relative text-left">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs font-bold text-lg select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRowMenuId(isMenuOpen ? null : `type-${item.id}`);
              }}
            >
              ···
            </Button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveRowMenuId(null)} />
                <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeaveType(item);
                      setTypeModalMode('view');
                      setIsTypeModalOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-750 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeaveType(item);
                      setTypeModalMode('edit');
                      setIsTypeModalOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-750 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete this leave type policy?`)) {
                        await leave.deleteLeaveType(item.id);
                        handleRefresh();
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

  // ── DataTable configurations for Leave Requests ───────────────────────────────────
  const fetchLeaveRequests = async (params: TableQueryParams) => {
    try {
      const res = await leave.getLeaveRequests({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        status: activeTab === 'approvals' ? 'Pending' : (params.filters?.status || undefined),
        search: params.filters?.employeeName || params.filters?.search || '',
      });
      const dataObj = res.data?.data || res.data;
      return {
        items: dataObj.items || [],
        totalCount: dataObj.totalCount || 0,
        pageSize: dataObj.pageSize || 10,
        pageIndex: (dataObj.pageIndex > 0 ? dataObj.pageIndex - 1 : 0),
      };
    } catch (error) {
      console.error(error);
      return { items: [], totalCount: 0, pageSize: 10, pageIndex: 0 };
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'destructive';
      default: return 'default';
    }
  };

  const leaveRequestColumns: DataTableColumnDef<LeaveRequestDto>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      isGlobalFilter: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold text-xs select-none">
            {row.original.employeeName ? row.original.employeeName.split(' ').map((n) => n[0]).join('') : 'EM'}
          </div>
          <span className="font-semibold text-slate-900">{row.original.employeeName}</span>
        </div>
      )
    },
    {
      accessorKey: 'leaveTypeName',
      header: 'Leave Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150">
          {row.original.leaveTypeName}
        </span>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Duration',
      cell: ({ row }) => {
        const start = new Date(row.original.startDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: '2-digit' });
        const end = new Date(row.original.endDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: '2-digit' });
        return (
          <div className="text-xs">
            <span className="text-slate-750 font-medium block">{start} - {end}</span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {new Date(row.original.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(row.original.endDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'totalHours',
      header: 'Hours',
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-slate-700">{row.original.totalHours} hrs</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'firstApprovalStatus',
      header: '1st Level',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.firstApprovalStatus)} className="scale-90 opacity-90">
          {row.original.firstApprovalStatus}
        </Badge>
      )
    },
    {
      accessorKey: 'secondApprovalStatus',
      header: '2nd Level',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.secondApprovalStatus)} className="scale-90 opacity-90">
          {row.original.secondApprovalStatus}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => {
        const item = row.original;
        const isMenuOpen = activeRowMenuId === `req-${item.id}`;

        const userRole = localStorage.getItem('role') || '';

        // Determine if approval actions are applicable for current row
        const needsFirstApproval = item.firstApprovalStatus === 'Pending' && item.status === 'Pending' && userRole === 'HR' ;
        const needsSecondApproval = item.firstApprovalStatus === 'Approved' && item.secondApprovalStatus === 'Pending' && item.status === 'Pending' && userRole === 'HR';

        return (
          <div className="relative text-left">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs font-bold text-lg select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRowMenuId(isMenuOpen ? null : `req-${item.id}`);
              }}
            >
              ···
            </Button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveRowMenuId(null)} />
                <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRequest(item);
                      setRequestModalMode('view');
                      setIsRequestModalOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-750 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    View Details
                  </button>

                  {needsFirstApproval && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequest(item);
                        setApprovalLevel('first');
                        setIsApprovalModalOpen(true);
                        setActiveRowMenuId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-emerald-650 hover:bg-emerald-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      1st Level Approve
                    </button>
                  )}

                  {needsSecondApproval && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequest(item);
                        setApprovalLevel('second');
                        setIsApprovalModalOpen(true);
                        setActiveRowMenuId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-emerald-650 hover:bg-emerald-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      2nd Level Approve
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Leave Management</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">HR Operations & Request Ledger</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'types' ? (
            <CustomButton
              type="button"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="text-xs font-bold px-4 py-2.5 rounded-xl"
              onClick={() => {
                setSelectedLeaveType(null);
                setTypeModalMode('create');
                setIsTypeModalOpen(true);
              }}
            >
              Add Leave Type
            </CustomButton>
          ) : (
            <CustomButton
              type="button"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="text-xs font-bold px-4 py-2.5 rounded-xl"
              onClick={() => {
                setSelectedRequest(null);
                setRequestModalMode('create');
                setIsRequestModalOpen(true);
              }}
            >
              Apply for Leave
            </CustomButton>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomCard
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="Total Applications"
          value={<>{stats.totalRequests} <span className="text-xs text-slate-400 font-normal">requests</span></>}
          iconBgClass="bg-slate-50 border-slate-100"
          iconTextClass="text-slate-700"
          gradientFrom="from-white"
          gradientTo="to-slate-50/50"
        />
        <CustomCard
          icon={<Clock className="h-5 w-5" />}
          title="Pending Approval"
          value={<>{stats.pendingApproval} <span className="text-xs text-amber-600 font-bold">awaiting</span></>}
          iconBgClass="bg-amber-50 border-amber-100"
          iconTextClass="text-amber-600"
          gradientFrom="from-white"
          gradientTo="to-amber-50/20"
        />
        <CustomCard
          icon={<UserCheck className="h-5 w-5" />}
          title="Approved Requests"
          value={<>{stats.approvedRequests} <span className="text-xs text-emerald-600 font-bold">approved</span></>}
          iconBgClass="bg-emerald-50 border-emerald-100"
          iconTextClass="text-emerald-600"
          gradientFrom="from-white"
          gradientTo="to-emerald-50/20"
        />
        <CustomCard
          icon={<Settings className="h-5 w-5" />}
          title="Active Leave Policies"
          value={<>{stats.activeLeaveTypes} <span className="text-xs text-blue-600 font-normal">rules</span></>}
          iconBgClass="bg-blue-50 border-blue-100"
          iconTextClass="text-blue-600"
          gradientFrom="from-white"
          gradientTo="to-blue-50/20"
        />
      </div>

      {/* In-Page Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => { setActiveTab('myLeaves'); setActiveRowMenuId(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 cursor-pointer
            ${activeTab === 'myLeaves' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
        >
          My Leave Ledger
        </button>
        <button
          onClick={() => { setActiveTab('approvals'); setActiveRowMenuId(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-1.5
            ${activeTab === 'approvals' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
        >
          Awaiting Review
          {stats.pendingApproval > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500 text-white font-mono">
              {stats.pendingApproval}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('types'); setActiveRowMenuId(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 cursor-pointer
            ${activeTab === 'types' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
        >
          Leave Policy Rules
        </button>
      </div>

      {/* Active Tab Table Display */}
      {activeTab === 'types' ? (
        <DataTable
          key={`types-${refreshCounter}`}
          columns={leaveTypeColumns}
          fetchData={fetchLeaveTypes}
          filterslot={0}
          filterableActive={false}
        />
      ) : (
        <DataTable
          key={`requests-${activeTab}-${refreshCounter}`}
          columns={leaveRequestColumns}
          fetchData={fetchLeaveRequests}
          filterslot={4}
          filterableActive={true}
        />
      )}

      {/* Modals Mounting */}
      <LeaveTypeFormModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        mode={typeModalMode}
        leaveTypeData={selectedLeaveType}
        onSave={handleRefresh}
      />

      <LeaveRequestFormModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        mode={requestModalMode}
        requestData={selectedRequest}
        onSave={handleRefresh}
      />

      <LeaveApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        request={selectedRequest}
        approvalLevel={approvalLevel}
        onApprove={handleRefresh}
      />
    </div>
  );
}
