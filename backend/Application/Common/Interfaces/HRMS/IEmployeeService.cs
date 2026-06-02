using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces;

public interface IEmployeeService
{
    Task<Response<PaginationResponse<EmployeeResponse>>> GetEmployeesAsync(EmployeeRequest request);
    Task<Response<List<EmployeeResponse>>> GetEmployeeDropdownAsync(EmployeeRequest request);
    Task<Response<EmployeeStatsResponse>> GetEmployeeStatsAsync();
    Task<Response<EmployeeFormDto>> GetEmployeeByIdAsync(int id);
    Task<Response<EmployeeFormDto>> CreateEmployeeAsync(EmployeeFormDto request);
    Task<Response<EmployeeResponse>> UpdateEmployeeAsync(int id, EmployeeFormDto request);
    Task<Response<bool>> DeleteEmployeeAsync(int id);
}
