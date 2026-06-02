namespace Domain.Entities.HRMS;

using Domain.Common;

public class LeaveType : BaseEntity
{
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }
}
