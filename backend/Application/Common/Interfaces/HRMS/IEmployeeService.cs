using Application.Common.Models;
using Application.Dtos.Hrms;

namespace Application.Common.Interfaces;

public interface IEmployeeService
{
    Task<PaginationResponse<EmployeeResponse>> GetEmployeesAsync(EmployeeRequest request);
}