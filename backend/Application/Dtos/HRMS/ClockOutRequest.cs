namespace Application.Dtos.HRMS;

/// <summary>
/// Application-layer clock-out command.
/// The server resolves the open attendance record (ClockOutTime == null) by EmployeeId.
/// </summary>
public class ClockOutRequest
{
    public Guid EmployeeId { get; set; }
}
