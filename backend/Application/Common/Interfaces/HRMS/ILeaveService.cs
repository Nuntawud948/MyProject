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

    // ── Admin / Automation ───────────────────────────────────────────────────

    /// <summary>
    /// Allocates leave balances for a single employee based on active LeaveTypes.
    /// Respects the RequiresOneYearService rule (0 hours until 1-year anniversary).
    /// Called automatically after new employee creation.
    /// </summary>
    Task AllocateInitialLeaveBalancesAsync(int employeeId);

    /// <summary>
    /// One-off back-fill: finds all active employees who have NO LeaveBalance records
    /// and runs AllocateInitialLeaveBalancesAsync for each of them.
    /// </summary>
    Task AllocateRetroactiveBalancesAsync();

    /// <summary>
    /// Yearly reset/rollover:
    ///  - Annual Leave (RequiresOneYearService=true): adds the year's quota to AvailableHours,
    ///    capped at MaxAccumulatedDays * 8.
    ///  - All other leaves: resets UsedHours → 0 and AllocatedHours → MaxDaysPerYear * 8.
    /// </summary>
    Task ProcessYearlyLeaveRolloverAsync();
}
