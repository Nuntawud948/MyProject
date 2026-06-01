using Application.Common.Models;
using Application.Dtos.UMS; // 👈 เปลี่ยนมาใช้ UMS DTO

namespace Application.Common.Interfaces;

public interface IAuthService
{
    // บริการตรวจสอบการล็อกอิน (ส่ง TokenResponse กลับไปเมื่อผ่าน)
    Task<Response<TokenResponse>> LoginAsync(LoginRequest request);

    // บริการสมัครสมาชิก (ถอดรหัสผ่านมาทำ Hash ความปลอดภัยสูง)
    Task<Response> RegisterAsync(LoginRequest request, string email, string role);
}
