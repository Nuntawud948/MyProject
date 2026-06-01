using Application.Common.Models;

namespace Application.Dtos.Hrms;

// รับค่าตัวกรองมาจากหน้าบ้าน (สืบทอด PaginationRequest มาด้วย)
public class EmployeeRequest : PaginationRequest
{
    public string? SearchText { get; set; }
    public string? Department { get; set; }
    public int? MinServiceYears { get; set; }
}