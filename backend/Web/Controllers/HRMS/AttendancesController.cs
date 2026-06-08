using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers.HRMS;

/// <summary>
/// Attendance endpoints — Clock-In (multipart/form-data), Clock-Out (JSON), Today Status.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AttendancesController(
    IAttendanceService attendanceService,
    IImageService imageService,
    IWebHostEnvironment env
) : ControllerBase
{
    /// <summary>
    /// Multipart/form-data clock-in endpoint.
    /// Structural fields are bound via [FromForm]; the photo file is bound as IFormFile.
    /// ImageSharp processes the stream server-side before persisting the record.
    /// </summary>
    // POST api/attendances/clock-in
    [HttpPost("clock-in")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ClockIn([FromForm] ClockInRequestDto form)
    {
        // ── Server-Side Image Processing (ImageSharp pipeline) ───────────────
        string? imageUrl = null;

        if (form.ImageFile is not null && form.ImageFile.Length > 0)
        {
            var uploadsDir = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "attendance");
            var filename   = $"clock-in-{form.EmployeeId}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

            using var stream = form.ImageFile.OpenReadStream();
            imageUrl = await imageService.ProcessAndSaveAsync(
                sourceStream   : stream,
                filename       : filename,
                saveDirectory  : uploadsDir,
                maxWidthPx     : 1024,
                qualityPercent : 80   // secondary compression after mobile's 60%
            );
        }

        // ── Build application-layer request ──────────────────────────────────
        var request = new ClockInRequest
        {
            EmployeeId    = form.EmployeeId,
            Latitude      = form.Latitude,
            Longitude     = form.Longitude,
            CheckInMethod = form.CheckInMethod,
            Reason        = form.Reason,
            ImageUrl      = imageUrl,
        };

        var result = await attendanceService.ClockInAsync(request);

        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Clock-out — resolves the open record for today by employeeId.</summary>
    // POST api/attendances/clock-out
    [HttpPost("clock-out")]
    public async Task<IActionResult> ClockOut([FromBody] ClockOutRequest request)
    {
        var result = await attendanceService.ClockOutAsync(request);

        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Returns today's attendance record for the given employee (or null).</summary>
    // GET api/attendances/today/{employeeId}
    [HttpGet("today/{employeeId:int}")]
    public async Task<IActionResult> GetToday(int employeeId)
    {
        var result = await attendanceService.GetTodayAttendanceAsync(employeeId);
        return Ok(result);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multipart Form DTO (Web-layer only — contains IFormFile)
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>
/// Web-layer DTO that consumes multipart/form-data from the mobile client.
/// Each property is decorated with [FromForm] to unpack form fields;
/// ImageFile is bound as an IFormFile stream.
/// </summary>
public class ClockInRequestDto
{
    [FromForm] public int      EmployeeId    { get; set; }
    [FromForm] public decimal  Latitude      { get; set; }
    [FromForm] public decimal  Longitude     { get; set; }
    [FromForm] public string   CheckInMethod { get; set; } = string.Empty;
    [FromForm] public string?  Reason        { get; set; }
    [FromForm] public IFormFile? ImageFile   { get; set; }
}
