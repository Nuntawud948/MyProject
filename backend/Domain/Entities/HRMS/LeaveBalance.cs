namespace Domain.Entities.HRMS;

using Domain.Common;

public class LeaveBalance : BaseEntity
{
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public int LeaveTypeId { get; set; }
    public LeaveType? LeaveType { get; set; }

    public decimal AllocatedHours { get; set; }
    public decimal UsedHours { get; set; }

    // Computed — not stored in DB
    public decimal RemainingHours => AllocatedHours - UsedHours;
}
