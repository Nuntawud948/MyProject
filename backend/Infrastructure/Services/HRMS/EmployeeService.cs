using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore; // 🌟 ปลดล็อกคำสั่ง .AsNoTracking() และ .CountAsync()

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
            // 1. ดึงข้อมูล Query พื้นฐานจากตารางพนักงาน
            IQueryable<Employee> query = context.Employees.AsNoTracking();

            // 🔍 2. ยิงกรองแยกชิ้นแบบ Type-Safe สไตล์ที่คุณต้นต้องการผ่าน Code ตัวใหม่
            query = filterService.ApplyStringFilter(query, e => e.FirstName, request.FirstName);
            query = filterService.ApplyStringFilter(query, e => e.LastName, request.LastName);
            query = filterService.ApplyStringFilter(query, e => e.Code, request.Code); // 👈 เปลี่ยนใช้ Code แล้ว
           // query = filterService.ApplyStringFilter(query, e => e.Department, request.Department);

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

            // 5. 🧠 นำข้อมูลดิบมาวนลูปปรุงสุกผ่าน DTO Self-Mapping
            var employeeList = await query.Select(e => new EmployeeResponse
            {
                Id = e.Id,
                Code = e.Code,
                FirstName = e.FirstName,
                LastName = e.LastName,
                StartDate = e.StartDate,
                IsActive = e.IsActive,
               // Department = e.Department,
              //  PhoneNumber = e.PhoneNumber,
              //  ResignationDate = e.ResignationDate
            }).ToListAsync();
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
}
