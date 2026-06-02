namespace Domain.Entities.HRMS;

using Domain.Common;

public class LeaveType : BaseEntity
{
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }

    /// <summary>
    /// If true, employee is allocated 0 hours until they have completed 1 year of service.
    /// </summary>
    public bool RequiresOneYearService { get; set; } = false;

    /// <summary>
    /// Maximum days a balance can accumulate (carry-forward cap).
    /// 0 means no cap. E.g. 14 for Annual Leave (14 days = 112 hours max).
    /// </summary>
    public decimal MaxAccumulatedDays { get; set; } = 0;
}
