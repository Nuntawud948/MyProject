using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.UMS;
using Domain.Entities.UMS;
using Infrastructure.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager; // 🔥 เปลี่ยนเป็น ApplicationRole ด้วย
    private readonly IFilterService _filterService;
    private readonly ISortService _sortService;
    private readonly IPaginationService _paginationService;
    private readonly IConfiguration _configuration;

    public AuthService(
        ApplicationDbContext context, 
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager, // 🔥 เปลี่ยนเป็น ApplicationRole
        IFilterService filterService, 
        ISortService sortService, 
        IPaginationService paginationService,
        IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _filterService = filterService;
        _sortService = sortService;
        _paginationService = paginationService;
        _configuration = configuration;
    }

    public async Task<Response<TokenResponse>> LoginAsync(LoginRequest request)
    {
        var account = await _userManager.FindByNameAsync(request.Username);

        if (account == null)
        {
            return new Response<TokenResponse> { IsSuccess = false, Message = $"Debug Error: บัญชี '{request.Username}' ไม่มีอยู่จริง" };
        }

        bool isPasswordValid = await _userManager.CheckPasswordAsync(account, request.Password);
        if (!isPasswordValid)
        {
            return new Response<TokenResponse> { IsSuccess = false, Message = "Invalid password. รหัสผ่านไม่ถูกต้อง" };
        }

        var userRoles = await _userManager.GetRolesAsync(account);
        var primaryRole = userRoles.FirstOrDefault() ?? "User";

        var (accessToken, expiresAt) = GenerateAccessToken(account, userRoles.ToList());
        var refreshToken = GenerateRefreshToken();

        // Update refresh token in DB
        var refreshTokenExpiryDays = _configuration.GetValue<int>("JwtSettings:RefreshTokenExpirationDays", 7);
        account.RefreshToken = refreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);
        await _userManager.UpdateAsync(account);

        var result = new TokenResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            Username = account.UserName ?? string.Empty,
            Role = primaryRole,
            EmployeeId = account.EmployeeId?.ToString() ?? string.Empty,
            ExpiresAt = expiresAt,
        };

        return new Response<TokenResponse> { IsSuccess = true, Data = result, Message = "Authentication successful." };
    }

    public async Task<Response<TokenResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var principal = GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            return new Response<TokenResponse> { IsSuccess = false, Message = "Invalid access token or refresh token" };
        }

        var username = principal.Identity?.Name;
        if (username == null)
        {
            return new Response<TokenResponse> { IsSuccess = false, Message = "Invalid access token or refresh token" };
        }

        var account = await _userManager.FindByNameAsync(username);
        if (account == null || account.RefreshToken != request.RefreshToken || account.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return new Response<TokenResponse> { IsSuccess = false, Message = "Invalid access token or refresh token" };
        }

        var userRoles = await _userManager.GetRolesAsync(account);
        var primaryRole = userRoles.FirstOrDefault() ?? "User";

        var (newAccessToken, expiresAt) = GenerateAccessToken(account, userRoles.ToList());
        var newRefreshToken = GenerateRefreshToken();

        // Rotate refresh token
        var refreshTokenExpiryDays = _configuration.GetValue<int>("JwtSettings:RefreshTokenExpirationDays", 7);
        account.RefreshToken = newRefreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);
        await _userManager.UpdateAsync(account);

        var result = new TokenResponse
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            Username = account.UserName ?? string.Empty,
            Role = primaryRole,
            EmployeeId = account.EmployeeId?.ToString() ?? string.Empty,
            ExpiresAt = expiresAt,
        };

        return new Response<TokenResponse> { IsSuccess = true, Data = result, Message = "Token refreshed successfully." };
    }

    public async Task<Response> RevokeTokenAsync(string username)
    {
        var account = await _userManager.FindByNameAsync(username);
        if (account == null)
        {
            return new Response { IsSuccess = false, Message = "User not found" };
        }

        account.RefreshToken = null;
        account.RefreshTokenExpiryTime = null;
        await _userManager.UpdateAsync(account);

        return new Response { IsSuccess = true, Message = "Token revoked successfully" };
    }

    public async Task<Response> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByNameAsync(request.Username);
        if (existingUser != null) return new Response { IsSuccess = false, Message = "Username already exists." };

        var newAccount = new ApplicationUser
        {
            UserName = request.Username,
            Email = request.Email,
            EmployeeId = request.EmployeeId
        };

        var result = await _userManager.CreateAsync(newAccount, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new Response { IsSuccess = false, Message = $"Registration failed: {errors}" };
        }

        return new Response { IsSuccess = true, Message = "User account registered successfully." };
    }

    public async Task<Response<bool>> CheckPasswordAsync(string username, string password)
    {
        var account = await _userManager.FindByNameAsync(username);
        if (account == null) return new Response<bool> { IsSuccess = false, Message = "Username does not exist.", Data = false };

        bool isPasswordValid = await _userManager.CheckPasswordAsync(account, password);
        return new Response<bool> { IsSuccess = isPasswordValid, Message = isPasswordValid ? "Password matches." : "Password mismatch.", Data = isPasswordValid };
    }

    public async Task<Response> ResetPasswordAsync(string username, string newPassword)
    {
        var account = await _userManager.FindByNameAsync(username);
        if (account == null) return new Response { IsSuccess = false, Message = "Username does not exist." };

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(account);
        var result = await _userManager.ResetPasswordAsync(account, resetToken, newPassword);

        if (!result.Succeeded) return new Response { IsSuccess = false, Message = "Failed to reset password." };

        return new Response { IsSuccess = true, Message = "Password has been successfully reset." };
    }

    public async Task<Response<PaginationResponse<UserAccountResponse>>> GetUserAccountsAsync(UserAccountRequest request)
    {
        try
        {
            var query = _context.Users.OfType<ApplicationUser>()
                .Include(u => u.Employee)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();
                query = query.Where(u => u.UserName.ToLower().Contains(search) || u.Email.ToLower().Contains(search));
            }

            query = _filterService.ApplyStringFilter(query, e => e.UserName, request.Username);
            query = _filterService.ApplyStringFilter(query, e => e.Email, request.Email);

            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                bool desc = request.SortDirection?.ToLower() == "desc";
                switch (request.SortBy.ToLower())
                {
                    case "username": query = desc ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName); break;
                    case "email": query = desc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email); break;
                    default: query = query.OrderByDescending(u => u.Id); break;
                }
            }
            else query = query.OrderByDescending(u => u.Id);

            var pagedEntities = await _paginationService.PaginateAsync(query, request.PageNumber, request.PageSize);
            
            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new UserAccountResponse
                {
                    // 🔥 [แก้ Error ที่ 3] ใช้ u.Id ได้เลยถ้า DTO กลับมาเป็น int แล้ว
                    Id = u.Id, 
                    Username = u.UserName,
                    Email = u.Email,
                    EmployeeId = u.EmployeeId,
                    EmployeeName = u.Employee != null ? u.Employee.FirstName + " " + u.Employee.LastName : string.Empty,
                })
                .ToListAsync();

            var paginationResult = new PaginationResponse<UserAccountResponse>(
                items, pagedEntities.PageNumber, pagedEntities.PageSize, pagedEntities.TotalRecords);
            
            return new Response<PaginationResponse<UserAccountResponse>> { IsSuccess = true, Message = "Success.", Data = paginationResult };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<UserAccountResponse>> { IsSuccess = false, Message = $"Failed: {ex.Message}" };
        }
    }

    public async Task<Response> UpdateUserAccountAsync(int id, UpdateUserAccountRequest request)
    {
        try
        {
            // 🔥 [แก้ Error ที่ 2] FindByIdAsync บังคับรับ String แม้คีย์จะเป็น int
            var user = await _userManager.FindByIdAsync(id.ToString()); 
            if (user == null) return new Response { IsSuccess = false, Message = "User account not found." };

            if (user.UserName.ToLower() != request.Username.ToLower())
            {
                var existingUser = await _userManager.FindByNameAsync(request.Username);
                if (existingUser != null && existingUser.Id != id)
                {
                    return new Response { IsSuccess = false, Message = "Username already exists." };
                }
            }

            user.UserName = request.Username;
            user.Email = request.Email;
            user.EmployeeId = request.EmployeeId;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded) return new Response { IsSuccess = false, Message = "Update failed." };

            return new Response { IsSuccess = true, Message = "User account updated successfully." };
        }
        catch (Exception ex)
        {
            return new Response { IsSuccess = false, Message = $"Failed to update: {ex.Message}" };
        }
    }

    private (string Token, DateTime ExpiresAt) GenerateAccessToken(ApplicationUser account, List<string> userRoles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = _configuration["JwtSettings:Secret"] ?? "SuperSecretKeyEnterpriseTierVector99999YourCompanySecretKey";
        var key = Encoding.ASCII.GetBytes(secretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()), 
            new Claim(ClaimTypes.Name, account.UserName ?? ""),
            new Claim(ClaimTypes.Email, account.Email ?? ""),
            new Claim("EmployeeId", account.EmployeeId?.ToString() ?? string.Empty) 
        };

        foreach (var role in userRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var expirationMinutes = _configuration.GetValue<int>("JwtSettings:AccessTokenExpirationMinutes", 15);
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = _configuration["JwtSettings:Issuer"] ?? "MyProjectBackend",
            Audience = _configuration["JwtSettings:Audience"] ?? "MyProjectFrontend",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiresAt);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var secretKey = _configuration["JwtSettings:Secret"] ?? "SuperSecretKeyEnterpriseTierVector99999YourCompanySecretKey";
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true, // We must validate it according to appsettings
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _configuration["JwtSettings:Issuer"] ?? "MyProjectBackend",
            ValidAudience = _configuration["JwtSettings:Audience"] ?? "MyProjectFrontend",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
            ValidateLifetime = false // Here we are saying that we don't care about the token's expiration date
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }
        catch
        {
            return null; // Return null if validation fails
        }
    }
}