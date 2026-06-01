namespace Domain.Entities.HRMS;
using Domain.Common;

public class Department : BaseEntity
{
    public string Code { get; set; } = string.Empty; 
    public string? Description { get; set; } 
}