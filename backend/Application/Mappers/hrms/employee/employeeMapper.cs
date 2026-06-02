using System;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Riok.Mapperly.Abstractions;

namespace Application.Mappers.hrms.employee;

[Mapper]
public partial class EmployeeMapper
{
    public static readonly EmployeeMapper Instance = new();

    // 1. Map Employee Entity to EmployeeResponse (for datatable)
    [MapProperty(nameof(Employee.WorkEmail), nameof(EmployeeResponse.Email))]
    [MapProperty(nameof(Employee.Role), nameof(EmployeeResponse.Position))]
    [MapProperty(nameof(Employee.EndDate), nameof(EmployeeResponse.ResignationDate))]

    public partial EmployeeResponse MapToResponse(Employee source);

    // Map List/Enumerable of Employees to list of EmployeeResponses
    public partial List<EmployeeResponse> MapToResponseList(IEnumerable<Employee> source);

    // 2. Map Employee Entity to EmployeeFormDto
    public partial EmployeeFormDto MapToFormDto(Employee source);

    // 3. Map EmployeeFormDto to Employee Entity
    public partial Employee MapToEntity(EmployeeFormDto source);

    // 4. Update existing Employee entity with Form DTO data
    public partial void UpdateEntity(EmployeeFormDto source, Employee target);
}
