using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.UMS;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Web.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // 🚪 [POST] /api/auth/login -> สำหรับเช็คชื่อพาสเวิร์ดรับ Token
    [HttpPost("login")]
    [EnableRateLimiting("LoginPolicy")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        if (!response.IsSuccess)
        {
            return BadRequest(response); // ส่ง 400 พร้อมซองข้อความเออร์เรอร์กลับไป
        }
        return Ok(response); // ส่ง 200 พร้อมซอง TokenResponse
    }

    // 🔄 [POST] /api/auth/refresh -> สำหรับต่ออายุ Token
    [HttpPost("refresh")]
    [EnableRateLimiting("LoginPolicy")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var response = await authService.RefreshTokenAsync(request);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // ⛔ [POST] /api/auth/revoke -> สำหรับเพิกถอนสิทธิ์ Token (ต้อง Login ก่อนถึงจะเตะตัวเองหรือคนอื่นได้)
    [HttpPost("revoke")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Revoke([FromBody] RevokeTokenRequest request)
    {
        var response = await authService.RevokeTokenAsync(request.Username);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 📝 [POST] /api/auth/register -> สำหรับสมัครสมาชิกโมดูล UMS (เผื่อใช้เทสสร้างไอดี)
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var response = await authService.RegisterAsync(request);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 🔍 [POST] /api/auth/check-password -> สำหรับเช็คความถูกต้องของรหัสผ่านกับ PasswordHash
    [HttpPost("check-password")]
    public async Task<IActionResult> CheckPassword([FromBody] LoginRequest request)
    {
        var response = await authService.CheckPasswordAsync(request.Username, request.Password);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    // 🔑 [POST] /api/auth/reset-password -> สำหรับตั้งรหัสผ่านใหม่ (Forgot Password)
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromQuery] string username, [FromQuery] string newPassword)
    {
        var response = await authService.ResetPasswordAsync(username, newPassword);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUserAccounts([FromQuery] UserAccountRequest request)
    {
        var response = await authService.GetUserAccountsAsync(request);
        return Ok(response);
    }

    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUserAccount(int id, [FromBody] UpdateUserAccountRequest request)
    {
        var response = await authService.UpdateUserAccountAsync(id, request);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}
