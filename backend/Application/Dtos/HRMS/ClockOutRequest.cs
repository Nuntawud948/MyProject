namespace Application.Dtos.HRMS;

/// <summary>
/// Application-layer clock-out command.
/// The server resolves the open attendance record (ClockOutTime == null) by EmployeeId.
/// </summary>
public class ClockOutRequest
{
    public int EmployeeId { get; set; }
    
    /// <summary>
    /// Relative URL path populated by the Web controller after ImageSharp processing.
    /// Example: "/uploads/attendance/clock-out-1717600000.jpg"
    /// </summary>
    public string? ImageUrl { get; set; }
}
