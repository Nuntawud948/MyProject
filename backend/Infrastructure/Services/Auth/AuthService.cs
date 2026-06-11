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

namespace Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager; // 🔥 เปลี่ยนเป็น ApplicationRole ด้วย
    private readonly IFilterService _filterService;
    private readonly ISortService _sortService;
    private readonly IPaginationService _paginationService;

    public AuthService(
        ApplicationDbContext context, 
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager, // 🔥 เปลี่ยนเป็น ApplicationRole
        IFilterService filterService, 
        ISortService sortService, 
        IPaginationService paginationService)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _filterService = filterService;
        _sortService = sortService;
        _paginationService = paginationService;
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

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("SuperSecretKeyEnterpriseTierVector99999YourCompanySecretKey"); 

        var claims = new List<Claim>
        {
            // 🔥 [แก้ Error ที่ 1] เติม .ToString() เพราะ Claim รับเฉพาะ String
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()), 
            new Claim(ClaimTypes.Name, account.UserName ?? ""),
            new Claim(ClaimTypes.Email, account.Email ?? ""),
            new Claim("EmployeeId", account.EmployeeId?.ToString() ?? string.Empty) 
        };

        foreach (var role in userRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddHours(8),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        var result = new TokenResponse
        {
            Token = tokenString,
            Username = account.UserName,
            Role = primaryRole,
            EmployeeId = account.EmployeeId?.ToString() ?? string.Empty,
            ExpiresAt = tokenDescriptor.Expires.Value,
        };

        return new Response<TokenResponse> { IsSuccess = true, Data = result, Message = "Authentication successful." };
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
}