using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.HRMS;

/// <summary>
/// Records a single attendance clock-in/out event for a mobile employee.
/// </summary>
public class Attendance
{
    // ── Primary Key ──────────────────────────────────────────────────────────
    public long Id { get; set; }

    // ── Employee Reference ───────────────────────────────────────────────────
    public int EmployeeId { get; set; }
    
    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }

    // ── Clock Timestamps ─────────────────────────────────────────────────────
    public DateTimeOffset ClockInTime { get; set; }
    public DateTimeOffset? ClockOutTime { get; set; }

    // ── GPS Coordinates ──────────────────────────────────────────────────────
    /// <summary>Precision 9, scale 6 (-999.999999 to 999.999999)</summary>
    public decimal Latitude { get; set; }

    /// <summary>Precision 9, scale 6 (-999.999999 to 999.999999)</summary>
    public decimal Longitude { get; set; }

    // ── Check-In Classification ──────────────────────────────────────────────
    /// <summary>'Auto' (geofence) or 'Manual' (self-reported).</summary>
    public string CheckInMethod { get; set; } = string.Empty;

    // ── Manual Check-In Evidence ─────────────────────────────────────────────
    /// <summary>Relative URL to uploaded photo. Required when CheckInMethod == "Manual".</summary>
    public string? ImageUrl { get; set; }

    /// <summary>Employee-supplied reason. Required when CheckInMethod == "Manual".</summary>
    public string? Reason { get; set; }

    // ── Approval ─────────────────────────────────────────────────────────────
    /// <summary>Default true for Auto; default false for Manual (requires manager review).</summary>
    public bool IsApproved { get; set; }

    // ── Audit Columns ────────────────────────────────────────────────────────
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
}
