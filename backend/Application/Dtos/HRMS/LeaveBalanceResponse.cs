namespace Application.Dtos.HRMS;

public class LeaveBalanceResponse
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public decimal AllocatedHours { get; set; }
    public decimal UsedHours { get; set; }
    public decimal RemainingHours { get; set; }
}
