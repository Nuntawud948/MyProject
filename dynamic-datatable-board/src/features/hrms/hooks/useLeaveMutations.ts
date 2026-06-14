import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leave } from '@/api/hrms/leave';
import type { LeaveRequestDto, LeaveApprovalDto } from '@/dto/hrms/leaveRequest';

export interface ApproveLeaveVariables {
  requestId: number;
  approvalLevel: 'first' | 'second';
  decision: 'Approved' | 'Rejected';
  remarks?: string;
}

export function useApproveLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approvalLevel, decision, remarks }: ApproveLeaveVariables) => {
      const payload: LeaveApprovalDto = {
        status: decision,
        remarks: remarks || undefined,
      };

      if (approvalLevel === 'first') {
        return leave.approveFirstLevel(requestId, payload);
      } else {
        return leave.approveSecondLevel(requestId, payload);
      }
    },
    onMutate: async (newApproval) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['leaveRequests'] });

      // The exact query key used by LeaveDashboardPage for KPI stats
      const exactQueryKey = ['leaveRequests', { pageIndex: 0, pageSize: 200 }];

      // 2. Snapshot the previous value
      const previousData = queryClient.getQueryData<any>(exactQueryKey);

      // 3. Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData(exactQueryKey, (old: any) => {
          if (!old || !old.items) return old;

          return {
            ...old,
            items: old.items.map((req: LeaveRequestDto) => {
              if (req.id === newApproval.requestId) {
                const updatedReq = { ...req };
                
                // Optimistically update the specific approval level
                if (newApproval.approvalLevel === 'first') {
                  updatedReq.firstApprovalStatus = newApproval.decision;
                } else {
                  updatedReq.secondApprovalStatus = newApproval.decision;
                }

                // Optimistically derive the overall status
                if (newApproval.decision === 'Rejected') {
                  updatedReq.status = 'Rejected';
                } else if (newApproval.approvalLevel === 'second' && newApproval.decision === 'Approved') {
                  updatedReq.status = 'Approved';
                }

                return updatedReq;
              }
              return req;
            }),
          };
        });
      }

      // 4. Return a context object with the snapshotted value for rollback
      return { previousData, exactQueryKey };
    },
    onError: (err, _newApproval, context) => {
      // Rollback to the previous value if the mutation fails
      if (context?.previousData) {
        queryClient.setQueryData(context.exactQueryKey, context.previousData);
      }
      console.error('Leave approval failed', err);
    },
    onSettled: () => {
      // Always invalidate to ensure sync with server truth
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
}
