using Application.Common.Interfaces;
using Application.Common.Models;
using Application.Dtos.Hrms;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Hrms;

// รับ ApplicationDbContext เข้ามาใช้งาน (Dependency Injection)
public class EmployeeService(ApplicationDbContext context) : IEmployeeService
{
    public async Task<PaginationResponse<EmployeeResponse>> GetEmployeesAsync(EmployeeRequest request)
    {
        // 1. ตั้งต้นดึงข้อมูลจากตาราง Employees
        var query = context.Employees.AsQueryable();

        // 2. ถ้ามีการค้นหาชื่อหรือรหัสพนักงาน ให้ต่อท้ายคำสั่ง WHERE
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            query = query.Where(e => e.FirstName.Contains(request.SearchText) || 
                                     e.LastName.Contains(request.SearchText) ||
                                     e.EmployeeCode.Contains(request.SearchText));
        }

        // ถ้ามีการกรองแผนก
        if (!string.IsNullOrWhiteSpace(request.Department))
        {
            query = query.Where(e => e.Department == request.Department);
        }

        // 3. นับจำนวนทั้งหมด (เอาไว้ทำปุ่มเปลี่ยนหน้าฝั่ง React)
        var totalCount = await query.CountAsync();

        // 4. ตัดแบ่งหน้า (Pagination: Skip และ Take)
        var skip = (request.PageNumber - 1) * request.PageSize;
        var employees = await query
            .OrderByDescending(e => e.StartDate) // เรียงคนเข้างานล่าสุดขึ้นก่อน
            .Skip(skip)
            .Take(request.PageSize)
            .ToListAsync();

        // 5. ปรุงสุกข้อมูล (Map) ก่อนส่งกลับให้ React
        var data = employees.Select(e => new EmployeeResponse
        {
            Id = e.Id,
            EmployeeCode = e.EmployeeCode,
            FullName = $"{e.FirstName} {e.LastName}",
            Department = e.Department ?? "ยังไม่ระบุแผนก",
            StartDate = e.StartDate,
            Status = e.IsActive ? "Active" : "Inactive",
            ServiceYears = DateTime.Now.Year - e.StartDate.Year // คำนวณอายุงาน
        }).ToList();

        // แพ็คใส่ซอง PaginationResponse
        return new PaginationResponse<EmployeeResponse>
        {
            Data = data,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}