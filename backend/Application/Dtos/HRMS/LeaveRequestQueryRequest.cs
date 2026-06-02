namespace Application.Dtos.HRMS;

using Application.Common.Models;

// Query params for listing leave requests
public class LeaveRequestQueryRequest : PaginationRequest
{
    public int? EmployeeId { get; set; }
    public string? Status { get; set; }
    public int? LeaveTypeId { get; set; }
    public new string? Search { get; set; }
}
