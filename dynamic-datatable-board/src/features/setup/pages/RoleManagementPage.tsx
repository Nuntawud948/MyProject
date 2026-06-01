/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Save, RefreshCw, KeyRound, Check, HelpCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface RolePermission {
  id: string;
  role: string;
  description: string;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canApprove: boolean;
  canReject: boolean;
  affectedUsers: number;
}

const INITIAL_ROLES: RolePermission[] = [
  {
    id: '1',
    role: 'Global Administrator',
    description: 'Full uninhibited access block across all modules, cloud databases, and systemic parameters.',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canApprove: true,
    canReject: true,
    affectedUsers: 3
  },
  {
    id: '2',
    role: 'HR Manager',
    description: 'Complete administration over staff rosters, status registers, leave workflows, and metrics reports.',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canApprove: true,
    canReject: true,
    affectedUsers: 14
  },
  {
    id: '3',
    role: 'Department Lead',
    description: 'Roster approval privileges, task overview permissions, and read indicators for core staff metrics.',
    canCreate: false,
    canRead: true,
    canEdit: true,
    canDelete: false,
    canExport: false,
    canApprove: true,
    canReject: true,
    affectedUsers: 25
  },
  {
    id: '4',
    role: 'HR Recruiter Specialist',
    description: 'Applicant profile tracking, pipeline candidate processing, and onboarding details creation.',
    canCreate: true,
    canRead: true,
    canEdit: true,
    canDelete: false,
    canExport: false,
    canApprove: false,
    canReject: false,
    affectedUsers: 8
  },
  {
    id: '5',
    role: 'Enterprise Compliance Auditor',
    description: 'Read-only audit privileges across operational databases, activity records, and exports logs.',
    canCreate: false,
    canRead: true,
    canEdit: false,
    canDelete: false,
    canExport: true,
    canApprove: false,
    canReject: false,
    affectedUsers: 2
  },
  {
    id: '6',
    role: 'Regular Staff Employee',
    description: 'Baseline self-service check-in, attendance request submittal, and profile view rights.',
    canCreate: false,
    canRead: true,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canApprove: false,
    canReject: false,
    affectedUsers: 215
  }
];

export function RoleManagementPage() {
  const [roles, setRoles] = useState<RolePermission[]>(INITIAL_ROLES);
  const [isSavedNotify, setIsSavedNotify] = useState(false);
  const [activeRoleInfo, setActiveRoleInfo] = useState<RolePermission | null>(INITIAL_ROLES[1]);

  const handleCheckboxChange = (roleId: string, flag: keyof Omit<RolePermission, 'id' | 'role' | 'description' | 'affectedUsers'>) => {
    // Safety check: Global Admin stays locked of changes
    const targetRole = roles.find(r => r.id === roleId);
    if (targetRole?.role === 'Global Administrator') {
      return;
    }

    setRoles(prev =>
      prev.map(row => {
        if (row.id === roleId) {
          return {
            ...row,
            [flag]: !row[flag]
          };
        }
        return row;
      })
    );

    // Update active visual panel details as well
    if (activeRoleInfo && activeRoleInfo.id === roleId) {
      setActiveRoleInfo(prev => prev ? {
        ...prev,
        [flag]: !prev[flag]
      } : null);
    }
  };

  const handleSavePolicy = () => {
    setIsSavedNotify(true);
    setTimeout(() => {
      setIsSavedNotify(false);
    }, 4500);
  };

  const handleResetDefaults = () => {
    setRoles(JSON.parse(JSON.stringify(INITIAL_ROLES)));
    setActiveRoleInfo(INITIAL_ROLES[1]);
  };

  const permissionKeys: { key: keyof Omit<RolePermission, 'id' | 'role' | 'description' | 'affectedUsers'>; label: string; color: string }[] = [
    { key: 'canCreate', label: 'Create', color: 'text-emerald-600 bg-emerald-50' },
    { key: 'canRead', label: 'Read', color: 'text-blue-600 bg-blue-50' },
    { key: 'canEdit', label: 'Edit', color: 'text-amber-600 bg-amber-50' },
    { key: 'canDelete', label: 'Delete', color: 'text-rose-600 bg-rose-50' },
    { key: 'canExport', label: 'Export', color: 'text-indigo-600 bg-indigo-50' },
    { key: 'canApprove', label: 'Approve', color: 'text-cyan-600 bg-cyan-50' },
    { key: 'canReject', label: 'Reject', color: 'text-orange-600 bg-orange-50' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Role Eligibilities & Access Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Audit system access policies, configure custom role-based privileges, and grant or toggle operations eligibility instantly across teams.
          </p>
        </div>

        {/* Global Save actions & reset button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs font-semibold h-9 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Restore Standard Settings
          </Button>
          <Button
            size="sm"
            onClick={handleSavePolicy}
            className="text-xs font-bold h-9 bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer gap-2"
          >
            <Save className="h-4 w-4" />
            Apply Policy Roster
          </Button>
        </div>
      </div>

      {/* Success Save Banner notification using motion-like standard alert style */}
      {isSavedNotify && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Check className="h-4.5 w-4.5 font-bold" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">RBAC Database Synced Successfully</p>
              <p className="text-[11px] text-slate-500 mt-0.5">The custom role eligibilities policy was successfully deployed and committed to active C# .NET security rule containers.</p>
            </div>
          </div>
          <Badge variant="success" className="bg-emerald-100 text-emerald-850 font-bold border-emerald-200">ACTIVE REGISTRY</Badge>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Interactive Matrix Datatable Left */}
        <div className="xl:col-span-3 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/75 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-emerald-500" />
              Role Eligibility Permission Panel
            </span>
          </div>

          <div className="relative w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 font-semibold text-slate-500 text-xs">
                  <th className="p-4 align-middle font-semibold min-w-[200px]">Enterprise Role Name</th>
                  {permissionKeys.map((perm) => (
                    <th key={perm.key} className="p-4 text-center align-middle font-semibold">
                      <span className={`px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${perm.color}`}>
                        {perm.label}
                      </span>
                    </th>
                  ))}
                  <th className="p-4 text-center align-middle font-semibold text-slate-400">Rosters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {roles.map((row) => {
                  const isAdmin = row.role === 'Global Administrator';
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setActiveRoleInfo(row)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                        activeRoleInfo?.id === row.id ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      {/* Role Info Column */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs md:text-sm">{row.role}</span>
                            {isAdmin && (
                              <Badge variant="default" className="text-[9px] bg-slate-900 border-0 h-4.5 px-1.5 py-0">
                                Locked
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-[260px] truncate leading-normal">
                            {row.description}
                          </p>
                        </div>
                      </td>

                      {/* Permissions Checkbox Ticks Grid */}
                      {permissionKeys.map((perm) => {
                        const isChecked = row[perm.key];
                        return (
                          <td key={perm.key} className="p-4 text-center align-middle">
                            <label className="inline-flex items-center justify-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                disabled={isAdmin}
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(row.id, perm.key)}
                                className={`h-4.5 w-4.5 rounded-md border-slate-300 text-slate-900 accent-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                              />
                            </label>
                          </td>
                        );
                      })}

                      {/* Users Count */}
                      <td className="p-4 text-center align-middle font-mono text-xs text-slate-500 font-bold">
                        {row.affectedUsers} staff
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50/40 border-t border-slate-100 text-slate-400 text-[10px] italic flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Note: Global Administrator permissions are securely cached as system invariants and cannot be edited.
          </div>
        </div>

        {/* Selected Role Meta-Details Sidecard Right */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4 text-left">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <ShieldAlert className="h-5 w-5 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Selection Profile
              </h3>
            </div>

            {activeRoleInfo ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{activeRoleInfo.role}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    {activeRoleInfo.description}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Current Action Privileges
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                    {permissionKeys.map((perm) => {
                      const enabled = activeRoleInfo[perm.key];
                      return (
                        <div key={perm.key} className="flex items-center gap-1.5 py-0.5">
                          <div className={`h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className={enabled ? 'text-slate-850' : 'text-slate-400 line-through font-normal'}>
                            {perm.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs border-t border-slate-150 pt-3 flex items-center justify-between text-slate-500 font-semibold">
                  <span>Assigned Headcount:</span>
                  <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {activeRoleInfo.affectedUsers} active users
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 italic font-medium select-none">
                Select a role layer from the permission matrix to display its diagnostic configuration details here.
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-3xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" />
              How role policies map?
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Changes applied here will automatically override standard token configurations in client navigation panels and backend authentication guards.
            </p>
            <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400 font-mono text-center">
              Active Server Module: RBACGuard v9.1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
