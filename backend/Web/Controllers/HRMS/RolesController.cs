using Application.Common.Interfaces;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController(IRoleService roleService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRoles([FromQuery] RoleRequest request)
    {
        var result = await roleService.GetRolesAsync(request);
        return Ok(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetActiveRoles([FromQuery] RoleRequest request)
    {
        var result = await roleService.GetAllActiveRolesAsync(request);
        return Ok(result);
    }
}
