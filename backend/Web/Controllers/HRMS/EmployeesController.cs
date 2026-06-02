using Application.Common.Interfaces;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")] // URL จะกลายเป็น /api/employees
public class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEmployees([FromQuery] EmployeeRequest request)
    {
        // รับ Request จากหน้าบ้าน -> โยนให้ Service ค้นหา -> ส่ง Result กลับไป
        var result = await employeeService.GetEmployeesAsync(request);
        return Ok(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetEmployeeDropdown([FromQuery] EmployeeRequest request)
    {
        var result = await employeeService.GetEmployeeDropdownAsync(request);
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetEmployeeStats()
    {
        var result = await employeeService.GetEmployeeStatsAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(int id)
    {
        var result = await employeeService.GetEmployeeByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] EmployeeFormDto request)
    {
        var result = await employeeService.CreateEmployeeAsync(request);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] EmployeeFormDto request)
    {
        var result = await employeeService.UpdateEmployeeAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var result = await employeeService.DeleteEmployeeAsync(id);
        return Ok(result);
    }
}
