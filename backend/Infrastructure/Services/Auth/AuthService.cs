using System.IdentityModel.Tokens.Jwt; // 👈 ใช้ตัวคลาสสิกนี้สำหรับ JwtSecurityTokenHandler ใน .NET
using System.Security.Claims;
using System.Text;
using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.UMS;
using Domain.Entities.UMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services.Auth;

public class AuthService(ApplicationDbContext context) : IAuthService
{
    // 🧠 ล็อกอินตรวจสอบบัญชีผู้ใช้
    public async Task<Response<TokenResponse>> LoginAsync(LoginRequest request)
    {
        // 1. ค้นหาบัญชีผู้ใช้จากระบบ UMS ใน Database
        var account = await context.UserAccounts.FirstOrDefaultAsync(u =>
            u.Username == request.Username && u.IsActive
        );

        if (account == null)
        {
            return new Response<TokenResponse>
            {
                IsSuccess = false,
                Message = "Invalid username or password.",
            };
        }

        // 2. ใช้ BCrypt ตรวจสอบว่ารหัสผ่านดิบ ตรงกับ Hash ในฐานข้อมูลไหม
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash);
        if (!isPasswordValid)
        {
            return new Response<TokenResponse>
            {
                IsSuccess = false,
                Message = "Invalid username or password.",
            };
        }

        // 3. ปรุงและเสกใบเบิกทาง JWT Token ความปลอดภัยสูง
        var tokenHandler = new JwtSecurityTokenHandler();

        // 🔑 คีย์ลับสำหรับเข้ารหัสระบบ (ในเฟสถัดไปเราจะย้ายไปเก็บใน appsettings.json เพื่อความปลอดภัย)
        var key = Encoding.ASCII.GetBytes("SuperSecretKeyEnterpriseTier99999!!!!");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(ClaimTypes.Name, account.Username),
                new Claim(ClaimTypes.Role, account.Role),
                new Claim(ClaimTypes.Email, account.Email),
            ]),
            Expires = DateTime.UtcNow.AddHours(8), // บัตรมีอายุใช้งาน 8 ชั่วโมง
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            ),
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // 4. บรรจุข้อมูลใส่ซองสำเร็จรูปส่งกลับออกไปแบบ New วัตถุตรงไปตรงมา
        var result = new TokenResponse
        {
            Token = tokenString,
            Username = account.Username,
            Role = account.Role,
            ExpiresAt = tokenDescriptor.Expires.Value,
        };

        return new Response<TokenResponse>
        {
            IsSuccess = true,
            Data = result,
            Message = "Authentication successful.",
        };
    }

    // 🔒 ระบบสมัครสมาชิกและแฮชรหัสผ่าน
    public async Task<Response> RegisterAsync(LoginRequest request, string email, string role)
    {
        // 1. เช็คว่ามี Username ซ้ำในระบบหรือไม่
        var isUserExists = await context.UserAccounts.AnyAsync(u => u.Username == request.Username);
        if (isUserExists)
        {
            return new Response { IsSuccess = false, Message = "Username already exists." };
        }

        // 2. เสก Salt และสั่งทำการล้างบางรหัสผ่านดิบให้กลายเป็นรหัสแฮชความปลอดภัยสูง
        string salt = BCrypt.Net.BCrypt.GenerateSalt(12); // Work Factor ระดับปลอดภัยมาตรฐานโลก
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password, salt);

        // 3. ประกอบข้อมูลเตรียมยัดลงตู้เซฟ PostgreSQL
        var newAccount = new UserAccount
        {
            Username = request.Username,
            PasswordHash = hashedPassword,
            Email = email,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        context.UserAccounts.Add(newAccount);
        await context.SaveChangesAsync();

        return new Response
        {
            IsSuccess = true,
            Message = "User account registered successfully within UMS schema.",
        };
    }
}
