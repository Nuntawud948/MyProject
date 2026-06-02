using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore; // 🌟 ปลดล็อกคำสั่ง .AsNoTracking() และ .CountAsync()
using Application.Mappers.hrms.employee;

namespace Infrastructure.Services.Hrms;

public class EmployeeService(
    ApplicationDbContext context,
    IFilterService filterService,
    ISortService sortService,
    IPaginationService paginationService
) : IEmployeeService
{
    public async Task<Response<PaginationResponse<EmployeeResponse>>> GetEmployeesAsync(
        EmployeeRequest request
    )
    {
        try
        {
            // 1. ดึงข้อมูล Query พื้นฐานจากตารางพนักงาน (รวมความสัมพันธ์เพื่อใช้แมป DTO)
            IQueryable<Employee> query = context.Employees
                .AsNoTracking()
                .Include(e => e.Department)
                .Include(e => e.Role)
                .Where(e => e.IsActive == true);

            query = filterService.ApplyStringFilter(query, e => e.FirstName, request.FirstName);
            query = filterService.ApplyStringFilter(query, e => e.LastName, request.LastName);
            query = filterService.ApplyStringFilter(query, e => e.Code, request.Code);

            if (request.DepartmentId.HasValue)
            {
                query = query.Where(e => e.DepartmentId == request.DepartmentId.Value);
            }

            if (request.RoleId.HasValue)
            {
                query = query.Where(e => e.RoleId == request.RoleId.Value);
            }

            // กรองด้วยสถานะ IsActive
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                bool isActiveFilter = request.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase
                );
                query = query.Where(e => e.IsActive == isActiveFilter);
            }

            // 3. จัดเรียงลำดับข้อมูล (Sort)
            query = sortService.ApplySort(
                query,
                request.SortBy,
                request.SortDirection,
                "StartDate"
            );

            // 4. 🚀 ดึงข้อมูลดิบและทำ Pagination ให้เสร็จสิ้น (ได้ออกเป็นข้อมูลดิบพนักงาน)
            var pagedEntities = await paginationService.PaginateAsync(
                query,
                request.PageNumber,
                request.PageSize
            );

            // 5. 🧠 นำข้อมูลดิบมาวนลูปปรุงสุกผ่าน DTO Mapperly
            var employeeList = EmployeeMapper.Instance.MapToResponseList(pagedEntities.Items);
            // 6. สรุปยอดห่อใส่ซองส่งคืน Web API
            var paginationResult = new PaginationResponse<EmployeeResponse>(
                employeeList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords
            );

            return new Response<PaginationResponse<EmployeeResponse>>
            {
                IsSuccess = true,
                Data = paginationResult,
                Message = "Paged employees retrieved successfully with direct filters.",
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<EmployeeResponse>>
            {
                IsSuccess = false,
                Data = null,
                Message = "An error occurred while processing the employee directory service.",
                Errors = new List<string> { ex.Message },
            };
        }
    }

    public async Task<Response<List<EmployeeResponse>>> GetEmployeeDropdownAsync(EmployeeRequest request)
    {
        try
        {
            var query = context.Employees.AsNoTracking().Where(e => e.IsActive);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var lowerSearch = request.Search.ToLower();
                query = query.Where(e => 
                    e.Code.ToLower().Contains(lowerSearch) || 
                    e.FirstName.ToLower().Contains(lowerSearch) || 
                    e.LastName.ToLower().Contains(lowerSearch)
                );
            }

            var employees = await query
                .Select(e => new EmployeeResponse
                {
                    Id = e.Id,
                    Code = e.Code,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    FullName = e.FirstName + " " + e.LastName,
                    Email = e.WorkEmail ?? "",
                    Department = e.Department != null ? e.Department.Name : "-",
                    Position = e.Role != null ? e.Role.Name : "-",
                    StartDate = e.StartDate ?? DateTime.UtcNow,
                    IsActive = e.IsActive,
                    PhoneNumber = "-"
                })
                .ToListAsync();

            return new Response<List<EmployeeResponse>>
            {
                IsSuccess = true,
                Data = employees,
                Message = "Employee dropdown list retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<List<EmployeeResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving employee dropdown list.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<EmployeeStatsResponse>> GetEmployeeStatsAsync()
    {
        try
        {
            var totalCount = await context.Employees.CountAsync();
            var activeCount = await context.Employees.CountAsync(e => e.IsActive);
            
            var newHiresCutoff = DateTime.UtcNow.AddDays(-365);
            var newHiresCount = await context.Employees.CountAsync(e => e.StartDate >= newHiresCutoff);

            var stats = new EmployeeStatsResponse
            {
                TotalCount = totalCount,
                ActiveCount = activeCount,
                NewHiresCount = newHiresCount
            };

            return new Response<EmployeeStatsResponse>
            {
                IsSuccess = true,
                Data = stats,
                Message = "Employee statistics calculated successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<EmployeeStatsResponse>
            {
                IsSuccess = false,
                Message = "An error occurred while calculating employee statistics.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<EmployeeFormDto>> GetEmployeeByIdAsync(int id)
    {
        try
        {
            var emp = await context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
            if (emp == null)
            {
                return new Response<EmployeeFormDto> { IsSuccess = false, Message = "Employee not found." };
            }

            var dto = EmployeeMapper.Instance.MapToFormDto(emp);

            return new Response<EmployeeFormDto> { IsSuccess = true, Data = dto };
        }
        catch (Exception ex)
        {
            return new Response<EmployeeFormDto> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<EmployeeFormDto>> CreateEmployeeAsync(EmployeeFormDto request)
    {
        try
        {
            var db = context.Employees;  

            var emp = EmployeeMapper.Instance.MapToEntity(request);

            db.Add(emp);
            
            await context.SaveChangesAsync();

           

           
            return new Response<EmployeeFormDto> 
                { IsSuccess = true, 
                    Data = request, 
                    Message = "Employee created successfully." };
        }
        catch (Exception ex)
        {
            return new Response<EmployeeFormDto> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<EmployeeResponse>> UpdateEmployeeAsync(int id, EmployeeFormDto request)
    {
        try
        {
            var emp = await context.Employees.FirstOrDefaultAsync(e => e.Id == id);
            if (emp == null)
            {
                return new Response<EmployeeResponse> { IsSuccess = false, Message = "Employee not found." };
            }

            EmployeeMapper.Instance.UpdateEntity(request, emp);

            await context.SaveChangesAsync();

            // Load relations to return populated EmployeeResponse
            var updated = await context.Employees
                .AsNoTracking()
                .Include(e => e.Department)
                .Include(e => e.Role)
                .FirstOrDefaultAsync(e => e.Id == emp.Id);

            var res = EmployeeMapper.Instance.MapToResponse(updated!);

            return new Response<EmployeeResponse> { IsSuccess = true, Data = res, Message = "Employee updated successfully." };
        }
        catch (Exception ex)
        {
            return new Response<EmployeeResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<bool>> DeleteEmployeeAsync(int id)
    {
        try
        {
            var emp = await context.Employees.FirstOrDefaultAsync(e => e.Id == id);
            if (emp == null)
            {
                return new Response<bool> { IsSuccess = false, Message = "Employee not found.", Data = false };
            }

            emp.IsActive = false; // Soft delete
            await context.SaveChangesAsync();

            return new Response<bool> { IsSuccess = true, Data = true, Message = "Employee deleted successfully (soft deleted)." };
        }
        catch (Exception ex)
        {
            return new Response<bool> { IsSuccess = false, Message = ex.Message, Data = false };
        }
    }
}
