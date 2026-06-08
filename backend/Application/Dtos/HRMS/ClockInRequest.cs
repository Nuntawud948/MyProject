namespace Application.Dtos.HRMS;

/// <summary>
/// Application-layer clock-in command (no IFormFile — Web layer handles the file).
/// The image is received by the controller as IFormFile, processed with ImageSharp,
/// saved to disk, and the resulting <see cref="ImageUrl"/> is injected here before
/// the service is called.
/// </summary>
public class ClockInRequest
{
    public int EmployeeId { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }

    /// <summary>'Auto' or 'Manual'</summary>
    public string CheckInMethod { get; set; } = string.Empty;

    /// <summary>Required when CheckInMethod == "Manual"</summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Relative URL path populated by the Web controller after ImageSharp processing.
    /// Example: "/uploads/attendance/clock-in-1717600000.jpg"
    /// </summary>
    public string? ImageUrl { get; set; }
}
