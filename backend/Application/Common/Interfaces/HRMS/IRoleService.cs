using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces;

public interface IRoleService
{
    Task<Response<PaginationResponse<RoleResponse>>> GetRolesAsync(RoleRequest request);
    Task<Response<List<RoleResponse>>> GetAllActiveRolesAsync(RoleRequest request);
}
