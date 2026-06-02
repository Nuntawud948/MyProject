namespace Application.Dtos.HRMS;

// Full flattened response for a leave request
public class LeaveRequestResponse
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;

    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalHours { get; set; }

    public string Reason { get; set; } = string.Empty;

    // Overall status: Pending | Approved | Rejected
    public string Status { get; set; } = string.Empty;

    public int? FirstApproverId { get; set; }
    public string? FirstApproverName { get; set; }
    public string FirstApprovalStatus { get; set; } = string.Empty;

    public int? SecondApproverId { get; set; }
    public string? SecondApproverName { get; set; }
    public string SecondApprovalStatus { get; set; } = string.Empty;

    public string? FirstApprovalReason { get; set; }
    public string? SecondApprovalReason { get; set; }

    public int SubmittedByEmployeeId { get; set; }
    public string? SubmittedByEmployeeName { get; set; }
    public string? OnBehalfReason { get; set; }

    public DateTime CreatedAt { get; set; }
}
