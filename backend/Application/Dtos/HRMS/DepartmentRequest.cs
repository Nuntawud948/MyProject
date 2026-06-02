using Application.Common.Models;

namespace Application.Dtos.HRMS;

public class DepartmentRequest : PaginationRequest
{
    public string? Code { get; set; }
    public string? Name { get; set; }
}
