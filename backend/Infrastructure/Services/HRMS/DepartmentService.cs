using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Hrms;

public class DepartmentService(
    ApplicationDbContext context,
    IFilterService filterService,
    ISortService sortService,
    IPaginationService paginationService
) : IDepartmentService
{
    public async Task<Response<PaginationResponse<DepartmentResponse>>> GetDepartmentsAsync(DepartmentRequest request)
    {
        try
        {
            IQueryable<Department> query = context.Departments.AsNoTracking();

            query = filterService.ApplyStringFilter(query, d => d.Code, request.Code);
            query = filterService.ApplyStringFilter(query, d => d.Name, request.Name);

            query = sortService.ApplySort(query, request.SortBy, request.SortDirection, "Name");

            var pagedEntities = await paginationService.PaginateAsync(query, request.PageNumber, request.PageSize);

            var deptList = await query.Select(d => new DepartmentResponse
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Description = d.Description
            }).ToListAsync();

            var paginationResult = new PaginationResponse<DepartmentResponse>(
                deptList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords
            );

            return new Response<PaginationResponse<DepartmentResponse>>
            {
                IsSuccess = true,
                Data = paginationResult,
                Message = "Paged departments retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<DepartmentResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving departments.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<List<DepartmentResponse>>> GetAllActiveDepartmentsAsync(DepartmentRequest request)
    {
        try
        {
            IQueryable<Department> query = context.Departments
                .AsNoTracking()
                .Where(d => d.IsActive);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = request.Search.ToLower();
                query = query.Where(d => d.Name.ToLower().Contains(keyword) || d.Code.ToLower().Contains(keyword));
            }

            var depts = await query
                .Select(d => new DepartmentResponse
                {
                    Id = d.Id,
                    Code = d.Code,
                    Name = d.Name,
                    Description = d.Description
                })
                .ToListAsync();

            return new Response<List<DepartmentResponse>>
            {
                IsSuccess = true,
                Data = depts,
                Message = "Active departments list retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<List<DepartmentResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving active departments.",
                Errors = new List<string> { ex.Message }
            };
        }
    }
}
