using Application.Common.Models;

namespace Application.Dtos.HRMS;

public class CompanyHolidayRequest : PaginationRequest
{
    public int? Year { get; set; }
    public string? Name { get; set; }
}
