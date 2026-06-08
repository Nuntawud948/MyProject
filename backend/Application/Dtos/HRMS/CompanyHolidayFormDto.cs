namespace Application.Dtos.HRMS;

public class CompanyHolidayFormDto
{
    public string Name { get; set; } = string.Empty;
    public DateOnly HolidayDate { get; set; }
    public string? Description { get; set; }
    public int Year { get; set; }
    public bool IsActive { get; set; } = true;
}
