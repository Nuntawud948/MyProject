using Application.Common.Models;

namespace Application.Dtos.HRMS;

public class RoleRequest : PaginationRequest
{
    public string? Code { get; set; }
    public string? Name { get; set; }
}
