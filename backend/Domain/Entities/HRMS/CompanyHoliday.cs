using Domain.Common;

namespace Domain.Entities.HRMS;

public class CompanyHoliday : BaseEntity
{
    public DateOnly HolidayDate { get; set; }
    public string? Description { get; set; }
    public int Year { get; set; }
}
