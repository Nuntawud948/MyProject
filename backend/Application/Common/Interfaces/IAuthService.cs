using Application.Common.Models;
using Application.Dtos.UMS; // 👈 เปลี่ยนมาใช้ UMS DTO

namespace Application.Common.Interfaces;

public interface IAuthService
{
    // บริการตรวจสอบการล็อกอิน (ส่ง TokenResponse กลับไปเมื่อผ่าน)
    Task<Response<TokenResponse>> LoginAsync(LoginRequest request);

    // บริการต่ออายุ Token
    Task<Response<TokenResponse>> RefreshTokenAsync(RefreshTokenRequest request);

    // บริการเพิกถอน Token (เตะออกจากระบบ)
    Task<Response> RevokeTokenAsync(string username);

    // บริการสมัครสมาชิก (ถอดรหัสผ่านมาทำ Hash ความปลอดภัยสูง)
    Task<Response> RegisterAsync(RegisterRequest request);

    // บริการตรวจสอบรหัสผ่านว่าตรงกับ Hash หรือไม่
    Task<Response<bool>> CheckPasswordAsync(string username, string password);

    // บริการตั้งค่ารหัสผ่านใหม่ (Reset/Forgot Password)
    Task<Response> ResetPasswordAsync(string username, string newPassword);

    // ดึงรายชื่อ User Accounts แบบมี Pagination และการค้นหา
    Task<Response<PaginationResponse<UserAccountResponse>>> GetUserAccountsAsync(UserAccountRequest request);

    // แก้ไขข้อมูลบัญชีผู้ใช้
    Task<Response> UpdateUserAccountAsync(int id, UpdateUserAccountRequest request);
}
