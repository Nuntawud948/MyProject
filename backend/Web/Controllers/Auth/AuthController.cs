using Application.Common.Interfaces;
using Application.Dtos.UMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // 🚪 [POST] /api/auth/login -> สำหรับเช็คชื่อพาสเวิร์ดรับ Token
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        if (!response.IsSuccess)
        {
            return BadRequest(response); // ส่ง 400 พร้อมซองข้อความเออร์เรอร์กลับไป
        }
        return Ok(response); // ส่ง 200 พร้อมซอง TokenResponse
    }

    // 📝 [POST] /api/auth/register -> สำหรับสมัครสมาชิกโมดูล UMS (เผื่อใช้เทสสร้างไอดี)
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] LoginRequest request,
        [FromQuery] string email,
        [FromQuery] string role = "User"
    )
    {
        var response = await authService.RegisterAsync(request, email, role);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
