using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Hrms;

public class RoleService(
    ApplicationDbContext context,
    IFilterService filterService,
    ISortService sortService,
    IPaginationService paginationService
) : IRoleService
{
    public async Task<Response<PaginationResponse<RoleResponse>>> GetRolesAsync(RoleRequest request)
    {
        try
        {
            IQueryable<Role> query = context.Roles.AsNoTracking();

            query = filterService.ApplyStringFilter(query, r => r.Code, request.Code);
            query = filterService.ApplyStringFilter(query, r => r.Name, request.Name);

            query = sortService.ApplySort(query, request.SortBy, request.SortDirection, "Name");

            var pagedEntities = await paginationService.PaginateAsync(query, request.PageNumber, request.PageSize);

            var roleList = await query.Select(r => new RoleResponse
            {
                Id = r.Id,
                Code = r.Code,
                Name = r.Name,
                Description = r.Description
            }).ToListAsync();

            var paginationResult = new PaginationResponse<RoleResponse>(
                roleList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords
            );

            return new Response<PaginationResponse<RoleResponse>>
            {
                IsSuccess = true,
                Data = paginationResult,
                Message = "Paged roles retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<RoleResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving roles.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<List<RoleResponse>>> GetAllActiveRolesAsync(RoleRequest request)
    {
        try
        {
            IQueryable<Role> query = context.Roles
                .AsNoTracking()
                .Where(r => r.IsActive);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = request.Search.ToLower();
                query = query.Where(r => r.Name.ToLower().Contains(keyword) || r.Code.ToLower().Contains(keyword));
            }

            var roles = await query
                .Select(r => new RoleResponse
                {
                    Id = r.Id,
                    Code = r.Code,
                    Name = r.Name,
                    Description = r.Description
                })
                .ToListAsync();

            return new Response<List<RoleResponse>>
            {
                IsSuccess = true,
                Data = roles,
                Message = "Active roles list retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<List<RoleResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving active roles.",
                Errors = new List<string> { ex.Message }
            };
        }
    }
}
