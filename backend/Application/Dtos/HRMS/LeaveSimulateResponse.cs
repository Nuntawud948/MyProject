namespace Application.Dtos.HRMS;

public class LeaveSimulateResponse
{
    // Number of weekday (Mon–Fri) days in the range
    public int WorkingDays { get; set; }

    // WorkingDays × 8h (9h shift − 1h lunch)
    public decimal TotalHours { get; set; }

    // Total calendar days − WorkingDays (weekend days skipped)
    public int ExcludedDays { get; set; }

    // Total calendar days in range (inclusive)
    public int TotalCalendarDays { get; set; }
}
