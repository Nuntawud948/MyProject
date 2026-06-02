using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces.HRMS;

public interface ILeaveService
{
    // ── Leave Types ──────────────────────────────────────────────────────────
    Task<Response<PaginationResponse<LeaveTypeResponse>>> GetLeaveTypesAsync(PaginationRequest request);
    Task<Response<LeaveTypeResponse>> GetLeaveTypeByIdAsync(int id);
    Task<Response<LeaveTypeResponse>> CreateLeaveTypeAsync(LeaveTypeRequest request);
    Task<Response<LeaveTypeResponse>> UpdateLeaveTypeAsync(int id, LeaveTypeRequest request);
    Task<Response<bool>> DeleteLeaveTypeAsync(int id);

    // ── Leave Balances ───────────────────────────────────────────────────────
    Task<Response<List<LeaveBalanceResponse>>> GetLeaveBalancesAsync(int employeeId);

    // ── Simulation ───────────────────────────────────────────────────────────
    Task<Response<LeaveSimulateResponse>> SimulateLeaveAsync(LeaveSimulateRequest request);

    // ── Leave Requests ───────────────────────────────────────────────────────
    Task<Response<PaginationResponse<LeaveRequestResponse>>> GetLeaveRequestsAsync(LeaveRequestQueryRequest request);
    Task<Response<LeaveRequestResponse>> GetLeaveRequestByIdAsync(int id);
    Task<Response<LeaveRequestResponse>> CreateLeaveRequestAsync(LeaveRequestRequest request);

    // ── Approvals ────────────────────────────────────────────────────────────
    Task<Response<LeaveRequestResponse>> ApproveFirstLevelAsync(int id, LeaveApprovalRequest request);
    Task<Response<LeaveRequestResponse>> ApproveSecondLevelAsync(int id, LeaveApprovalRequest request);
}
