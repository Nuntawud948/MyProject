namespace Application.Dtos.HRMS;

// Payload for creating a new leave request
public class LeaveRequestRequest
{
    // The employee who is taking leave
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;

    // "Apply on Behalf" — the logged-in employee who is submitting
    public int SubmittedByEmployeeId { get; set; }
    public string? OnBehalfReason { get; set; }
}
