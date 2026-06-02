using Application.Common.Models;
using Application.Dtos.UMS; // 👈 เปลี่ยนมาใช้ UMS DTO

namespace Application.Common.Interfaces;

public interface IAuthService
{
    // บริการตรวจสอบการล็อกอิน (ส่ง TokenResponse กลับไปเมื่อผ่าน)
    Task<Response<TokenResponse>> LoginAsync(LoginRequest request);

    // บริการสมัครสมาชิก (ถอดรหัสผ่านมาทำ Hash ความปลอดภัยสูง)
    Task<Response> RegisterAsync(LoginRequest request, string email, string role);

    // บริการตรวจสอบรหัสผ่านว่าตรงกับ Hash หรือไม่
    Task<Response<bool>> CheckPasswordAsync(string username, string password);

    // บริการตั้งค่ารหัสผ่านใหม่ (Reset/Forgot Password)
    Task<Response> ResetPasswordAsync(string username, string newPassword);
}
