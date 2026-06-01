using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.Hrms;
using Infrastructure.Database;

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
        // 1. ตั้งต้นดึงข้อมูล Query จากฐานข้อมูล
        var query = context.Employees.AsQueryable();

        // 2. ใช้สมองกลกลางกรองและจัดเรียงข้อมูล Dynamic
        query = filterService.ApplyGlobalSearch(
            query,
            request.SearchText,
            ["FirstName", "LastName", "EmployeeCode"]
        );
        query = filterService.ApplyStringFilter(query, e => e.Department, request.Department);
        query = sortService.ApplySort(query, request.SortBy, request.SortDirection, "StartDate");

        // 3. 🚀 ดึงข้อมูลดิบและทำ Pagination ให้เสร็จสิ้นก่อน (ได้ออกเป็นข้อมูลดิบพนักงาน)
        var pagedEntities = await paginationService.PaginateAsync(
            query,
            request.PageNumber,
            request.PageSize
        );

        // 4. 🧠 นำข้อมูลดิบมาวนลูปปรุงสุกผ่าน DTO Self-Mapping หลังจาก Query เสร็จสิ้นแล้ว
        var mappedData = pagedEntities.Data.Select(EmployeeResponse.MapFromEntity).ToList();
        // 5. 📦 บรรจุลงกล่อง PaginationResponse ชั้นในสำหรับดีทีโอ
        var finalResult = new PaginationResponse<EmployeeResponse>
        {
            Data = mappedData,
            TotalCount = pagedEntities.TotalCount,
            PageNumber = pagedEntities.PageNumber,
            PageSize = pagedEntities.PageSize,
        };

        // 6. ส่งคืนกลับด้วยซองรูปแบบ Response หลักของระบบ
        return new Response<PaginationResponse<EmployeeResponse>>
        {
            IsSuccess = true,
            Data = finalResult,
            Message = "Data retrieved successfully",
        };
    }
}
