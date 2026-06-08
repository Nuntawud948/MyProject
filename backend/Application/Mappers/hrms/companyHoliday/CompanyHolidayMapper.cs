using Riok.Mapperly.Abstractions;
using Domain.Entities.HRMS;
using Application.Dtos.HRMS;

namespace Application.Mappers.hrms.companyHoliday;

[Mapper]
public partial class CompanyHolidayMapper
{
    public static readonly CompanyHolidayMapper Instance = new();

    public partial CompanyHolidayResponse MapToResponse(CompanyHoliday source);
    public partial List<CompanyHolidayResponse> MapToResponseList(IEnumerable<CompanyHoliday> source);
    public partial CompanyHolidayFormDto MapToFormDto(CompanyHoliday source);
    public partial CompanyHoliday MapToEntity(CompanyHolidayFormDto source);
    public partial void UpdateEntity(CompanyHolidayFormDto source, CompanyHoliday target);
}
