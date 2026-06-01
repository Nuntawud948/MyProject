using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces;

public interface IEmployeeService
{
    Task<Response<PaginationResponse<EmployeeResponse>>> GetEmployeesAsync(EmployeeRequest request);
}
