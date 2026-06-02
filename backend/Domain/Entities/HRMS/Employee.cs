namespace Domain.Entities.HRMS;

using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common; // อย่าลืม using BaseEntity
using Domain.Entities.UMS;

// 1. ใส่ : BaseEntity เพื่อสืบทอด
public class Employee : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty; 
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int? UserAccountId { get; set; } 
    [ForeignKey(nameof(UserAccountId))]
    public UserAccount? UserAccount { get; set; }
    
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? DepartmentId { get; set; } 
    public Department? Department { get; set; }

    public int? RoleId { get; set; } 
    public Role? Role { get; set; }
    public string? Phonenumber { get; set; } 
    public int? BusinessUnitId { get; set; } 
    [ForeignKey(nameof(BusinessUnitId))]
    public BusinessUnit? BusinessUnit { get; set; }

    public string? EmploymentType { get; set; } 
    public decimal? Salary { get; set; } 
    
    public int? FirstApproverId { get; set; }
    [ForeignKey(nameof(FirstApproverId))]
    public Employee? FirstApprover { get; set; }
    public int? SecondApproverId { get; set; }
    [ForeignKey(nameof(SecondApproverId))]
    public Employee? SecondApprover { get; set; }
    public string? ProfilePictureUrl { get; set; } 
    public string? WorkEmail { get; set; } 
}