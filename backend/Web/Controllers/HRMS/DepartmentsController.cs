using Application.Common.Interfaces;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(IDepartmentService departmentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDepartments([FromQuery] DepartmentRequest request)
    {
        var result = await departmentService.GetDepartmentsAsync(request);
        return Ok(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetActiveDepartments([FromQuery] DepartmentRequest request)
    {
        var result = await departmentService.GetAllActiveDepartmentsAsync(request);
        return Ok(result);
    }
}
