namespace Application.Dtos.HRMS;

public class CompanyHolidayResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly HolidayDate { get; set; }
    public string? Description { get; set; }
    public int Year { get; set; }
    public bool IsActive { get; set; }
}
