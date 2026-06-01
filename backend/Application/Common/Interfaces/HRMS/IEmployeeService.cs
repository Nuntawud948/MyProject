using Application.Common.Models;
using Application.Dtos.Hrms;

namespace Application.Common.Interfaces;

public interface IEmployeeService
{
    // หน้าบ้านสั่งมาว่า "ขอข้อมูลพนักงานตามเงื่อนไขนี้หน่อย"
    Task<PaginationResponse<EmployeeProfileResponse>> GetEmployeesAsync(EmployeeSearchRequest request);
}