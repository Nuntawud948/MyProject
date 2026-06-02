namespace Application.Dtos.HRMS;

public class LeaveTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }
}
