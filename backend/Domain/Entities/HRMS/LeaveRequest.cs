namespace Domain.Entities.HRMS;

using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common;

public class LeaveRequest : BaseEntity
{
    // The employee who is taking the leave
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public int LeaveTypeId { get; set; }
    public LeaveType? LeaveType { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Calculated by simulation (excludes weekends, deducts lunch)
    public decimal TotalHours { get; set; }

    public string Reason { get; set; } = string.Empty;

    // Overall request status: Pending | Approved | Rejected
    public string Status { get; set; } = "Pending";

    // First-level approval
    public int? FirstApproverId { get; set; }
    [ForeignKey(nameof(FirstApproverId))]
    public Employee? FirstApprover { get; set; }
    public string FirstApprovalStatus { get; set; } = "Pending";

    // Second-level approval
    public int? SecondApproverId { get; set; }
    [ForeignKey(nameof(SecondApproverId))]
    public Employee? SecondApprover { get; set; }
    public string SecondApprovalStatus { get; set; } = "Pending";

    // Approval reasons
    public string? FirstApprovalReason { get; set; }
    public string? SecondApprovalReason { get; set; }

    // "Apply on Behalf" — the Employee who submitted this request
    // (may differ from EmployeeId when a manager applies on behalf of a subordinate)
    public int SubmittedByEmployeeId { get; set; }
    public string? OnBehalfReason { get; set; }
}
