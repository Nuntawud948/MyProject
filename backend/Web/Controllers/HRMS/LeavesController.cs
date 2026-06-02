using Application.Common.Interfaces.HRMS;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers.HRMS;

[ApiController]
[Route("api/[controller]")]
public class LeavesController(ILeaveService leaveService) : ControllerBase
{
    // ── Leave Types ──────────────────────────────────────────────────────────

    [HttpGet("types")]
    public async Task<IActionResult> GetLeaveTypes([FromQuery] PaginationRequest request)
    {
        var result = await leaveService.GetLeaveTypesAsync(request);
        return Ok(result);
    }

    [HttpGet("types/{id:int}")]
    public async Task<IActionResult> GetLeaveTypeById(int id)
    {
        var result = await leaveService.GetLeaveTypeByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost("types")]
    public async Task<IActionResult> CreateLeaveType([FromBody] LeaveTypeRequest request)
    {
        var result = await leaveService.CreateLeaveTypeAsync(request);
        return Ok(result);
    }

    [HttpPut("types/{id:int}")]
    public async Task<IActionResult> UpdateLeaveType(int id, [FromBody] LeaveTypeRequest request)
    {
        var result = await leaveService.UpdateLeaveTypeAsync(id, request);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("types/{id:int}")]
    public async Task<IActionResult> DeleteLeaveType(int id)
    {
        var result = await leaveService.DeleteLeaveTypeAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    // ── Leave Balances ───────────────────────────────────────────────────────

    [HttpGet("balances/{employeeId:int}")]
    public async Task<IActionResult> GetLeaveBalances(int employeeId)
    {
        var result = await leaveService.GetLeaveBalancesAsync(employeeId);
        return Ok(result);
    }

    // ── Simulation ───────────────────────────────────────────────────────────

    [HttpPost("simulate")]
    public async Task<IActionResult> SimulateLeave([FromBody] LeaveSimulateRequest request)
    {
        var result = await leaveService.SimulateLeaveAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // ── Leave Requests ───────────────────────────────────────────────────────

    [HttpGet("requests")]
    public async Task<IActionResult> GetLeaveRequests([FromQuery] LeaveRequestQueryRequest request)
    {
        var result = await leaveService.GetLeaveRequestsAsync(request);
        return Ok(result);
    }

    [HttpGet("requests/{id:int}")]
    public async Task<IActionResult> GetLeaveRequestById(int id)
    {
        var result = await leaveService.GetLeaveRequestByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost("requests")]
    public async Task<IActionResult> CreateLeaveRequest([FromBody] LeaveRequestRequest request)
    {
        var result = await leaveService.CreateLeaveRequestAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // ── Approvals ────────────────────────────────────────────────────────────

    [HttpPut("requests/{id:int}/approve/first")]
    public async Task<IActionResult> ApproveFirstLevel(int id, [FromBody] LeaveApprovalRequest request)
    {
        var result = await leaveService.ApproveFirstLevelAsync(id, request);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPut("requests/{id:int}/approve/second")]
    public async Task<IActionResult> ApproveSecondLevel(int id, [FromBody] LeaveApprovalRequest request)
    {
        var result = await leaveService.ApproveSecondLevelAsync(id, request);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }
}
