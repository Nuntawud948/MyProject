using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Web.Extensions; // 👈 อย่าลืมดึง Extension ตัวแกะกุญแจมาใช้

namespace Web.Controllers.HRMS;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendancesController(
    IAttendanceService attendanceService,
    IImageService imageService,
    IWebHostEnvironment env
) : ControllerBase
{
    // POST api/attendances/clock-in
    [HttpPost("clock-in")]
    [Consumes("multipart/form-data")]
    [EnableRateLimiting("CheckInPolicy")]
    public async Task<IActionResult> ClockIn([FromForm] ClockInRequestDto form)
    {
        // 🔥 1. แกะรหัสพนักงานตัวจริงเสียงจริง จาก JWT Token เท่านั้น!
        var currentEmployeeId = User.GetEmployeeId();
        if (currentEmployeeId == null) 
            return Unauthorized(new { IsSuccess = false, Message = "ไม่พบข้อมูลพนักงานใน Token" });

        string? imageUrl = null;

        if (form.ImageFile is not null && form.ImageFile.Length > 0)
        {
            var uploadsDir = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "attendance");
            
            // 🔥 ใช้ ID จริงจาก Token ในการตั้งชื่อไฟล์ ป้องกันการสวมรอยชื่อไฟล์
            var filename = $"clock-in-{currentEmployeeId.Value}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

            using var stream = form.ImageFile.OpenReadStream();
            imageUrl = await imageService.ProcessAndSaveAsync(
                sourceStream   : stream,
                filename       : filename,
                saveDirectory  : uploadsDir,
                maxWidthPx     : 1024,
                qualityPercent : 80   
            );
        }

        var request = new ClockInRequest
        {
            // 🔥 ยัด ID จาก Token ลงไปใน Application Request (ไม่สนว่าหน้าบ้านจะส่งอะไรมา)
            EmployeeId    = currentEmployeeId.Value, 
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

    // POST api/attendances/clock-out
    [HttpPost("clock-out")]
    [EnableRateLimiting("CheckInPolicy")]
    public async Task<IActionResult> ClockOut([FromBody] ClockOutRequest request)
    {
        // 🔥 2. ดักการลงเวลาออกแทนกัน
        var currentEmployeeId = User.GetEmployeeId();
        if (currentEmployeeId == null) 
            return Unauthorized(new { IsSuccess = false, Message = "ไม่พบข้อมูลพนักงาน" });

        // บังคับเขียนทับ EmployeeId ใน request ด้วย ID จริงจาก Token เสมอ
        request.EmployeeId = currentEmployeeId.Value;

        var result = await attendanceService.ClockOutAsync(request);

        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // GET api/attendances/today
    // 🔥 3. ลบ {employeeId:int} ออกจาก URL ไม่ต้องให้ผู้ใช้บอกว่าตัวเองคือใคร!
    [HttpGet("today")] 
    public async Task<IActionResult> GetToday()
    {
        var currentEmployeeId = User.GetEmployeeId();
        if (currentEmployeeId == null) 
            return Unauthorized();

        // ดึงสถานะของพนักงานที่ล็อกอินอยู่เท่านั้น
        var result = await attendanceService.GetTodayAttendanceAsync(currentEmployeeId.Value);
        return Ok(result);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multipart Form DTO (Web-layer only)
// ─────────────────────────────────────────────────────────────────────────────

public class ClockInRequestDto
{
  
    
    [FromForm] public decimal  Latitude      { get; set; }
    [FromForm] public decimal  Longitude     { get; set; }
    [FromForm] public string   CheckInMethod { get; set; } = string.Empty;
    [FromForm] public string?  Reason        { get; set; }
    [FromForm] public IFormFile? ImageFile   { get; set; }
}