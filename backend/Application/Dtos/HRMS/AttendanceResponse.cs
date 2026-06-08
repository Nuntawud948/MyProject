namespace Application.Dtos.HRMS;

/// <summary>
/// Response DTO for an Attendance record — mirrors the Attendance domain entity.
/// </summary>
public class AttendanceResponse
{
    public long Id { get; set; }
    public int EmployeeId { get; set; }

    public DateTimeOffset ClockInTime { get; set; }
    public DateTimeOffset? ClockOutTime { get; set; }

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }

    /// <summary>'Auto' or 'Manual'</summary>
    public string CheckInMethod { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
    public string? Reason { get; set; }

    public bool IsApproved { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
