using System;

namespace Application.Dtos.HRMS;

public class EmployeeFormDto
{
    public int? Id { get; set; }
    public string Code { get; set; } = null!;
    public string Title { get; set; } = "Mr.";
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? DepartmentId { get; set; }
    public int? RoleId { get; set; }
    public int? FirstApproverId { get; set; }
    public int? SecondApproverId { get; set; }
    public string? EmploymentType { get; set; }
    public string? Phonenumber { get; set; }
    public decimal? Salary { get; set; }
    public string? WorkEmail { get; set; }
    public bool IsActive { get; set; } = true;
}
