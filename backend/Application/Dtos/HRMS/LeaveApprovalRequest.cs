namespace Application.Dtos.HRMS;

public class LeaveApprovalRequest
{
    // Approved | Rejected
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
}
