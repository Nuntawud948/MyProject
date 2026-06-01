namespace Domain.Entities.HRMS;
using Domain.Common; // อย่าลืม using BaseEntity

// 1. ใส่ : BaseEntity เพื่อสืบทอด
public class Employee : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty; 
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }

    public int? DepartmentId { get; set; } 
    public Department? Department { get; set; }

    public int? RoleId { get; set; } 
    public Role? Role { get; set; }

    public int? BusinessUnitId { get; set; } 
    public BusinessUnit? BusinessUnit { get; set; }

    public string? EmploymentType { get; set; } 
    public decimal? Salary { get; set; } 
}