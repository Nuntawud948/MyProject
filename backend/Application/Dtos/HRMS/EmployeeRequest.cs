using Application.Common.Models;

namespace Application.Dtos.HRMS;

// รับค่าตัวกรองมาจากหน้าบ้าน (สืบทอด PaginationRequest มาด้วย)
public class EmployeeRequest : PaginationRequest
{
    public string? Code { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Department { get; set; }
    public int? DepartmentId { get; set; }
    public int? RoleId { get; set; }
    public string? Status { get; set; }
}
