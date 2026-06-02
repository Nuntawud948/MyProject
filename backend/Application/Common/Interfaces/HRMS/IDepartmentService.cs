using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces;

public interface IDepartmentService
{
    Task<Response<PaginationResponse<DepartmentResponse>>> GetDepartmentsAsync(DepartmentRequest request);
    Task<Response<List<DepartmentResponse>>> GetAllActiveDepartmentsAsync(DepartmentRequest request);
}
