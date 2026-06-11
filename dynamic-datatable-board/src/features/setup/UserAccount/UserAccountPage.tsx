import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable, DataTableColumnDef, TableQueryParams } from '@/components/shared/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomButton } from '@/components/custom/CustomButton';
import { userAccountApi } from '@/api/ums/userAccount.api';
import { UserAccountResponse } from '@/dto/ums/userAccount';
import { UserAccountFormModal } from './UserAccountFormModal';
import { ResetPasswordModal } from './ResetPasswordModal';

export function UserAccountPage() {
  const [activeRowMenuId, setActiveRowMenuId] = useState<number | null>(null);

  // Dialog/Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserAccountResponse | null>(null);

  // Reload counter to force table re-fetch
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Reset Password Modal State
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');

  const handleResetPassword = (item: UserAccountResponse) => {
    setResetUsername(item.username);
    setIsResetDialogOpen(true);
  };

  const columns: DataTableColumnDef<UserAccountResponse>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'string',
      filterPlaceholder: 'Search username...',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">{row.original.username}</span>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'string',
      filterPlaceholder: 'Search email...',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.email}</span>
      )
    },
    {
      accessorKey: 'roleName',
      header: 'Assigned Role',
      cell: ({ row }) => (
        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1.5 rounded-lg text-xs">
          {row.original.roleName || 'No Role'}
        </span>
      )
    },
    {
      accessorKey: 'employeeName',
      header: 'Employee Profile',
      cell: ({ row }) => (
        <span className="text-slate-700 font-medium">{row.original.employeeName || 'Unassigned'}</span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Account Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row }) => {
        const val = row.original.createdAt;
        return (
          <span className="text-slate-500 font-mono text-xs">
            {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
          </span>
        );
      }
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
                <div className="absolute right-0 mt-1.5 w-40 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(item);
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
                      setSelectedUser(item);
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
                    onClick={() => {
                      handleResetPassword(item);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-emerald-650 hover:bg-emerald-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const fetchUsers = async (params: TableQueryParams) => {
    const response = await userAccountApi.getUsers(params);
    const serverPayload = response.data;
    const rawItems = serverPayload?.items || [];
    console.log(rawItems);
    const mappedItems: UserAccountResponse[] = rawItems.map((item: any) => ({
      id: item.id || item.Id,
      username: item.username || item.Username || '',
      email: item.email || item.Email || '',
      roleId: item.roleId || item.RoleId || null,
      roleName: item.roleName || item.RoleName || '',
      employeeId: item.employeeId || item.EmployeeId || null,
      employeeName: item.employeeName || item.EmployeeName || '',
      isActive: item.isActive !== false,
      createdAt: item.createdAt || item.CreatedAt || '',
    }));
    console.log("Test");
  console.log(rawItems);
    return {
      items: mappedItems,
      totalCount: serverPayload?.totalCount || 0,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex
    };
  };

  const handleSaveUser = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Page Title & Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            User Accounts Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, view details, configure roles/profiles, and perform password resets for user credentials.
          </p>
        </div>
      </div>

      <CustomButton
        variant="primary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => {
          setSelectedUser(null);
          setDialogMode('create');
          setIsDialogOpen(true);
        }}
      >
        Add User Account
      </CustomButton>

      

      <DataTable
        key={refreshCounter}
        columns={columns}
        fetchData={fetchUsers}
        filterslot={2}
        filterableActive={true}
      />

      <UserAccountFormModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        userData={selectedUser}
        onSave={handleSaveUser}
      />

      <ResetPasswordModal
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        username={resetUsername}
      />
    </div>
  );
}
