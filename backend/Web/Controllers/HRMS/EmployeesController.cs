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
}
