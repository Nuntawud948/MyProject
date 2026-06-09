using Application.Common.Interfaces.HRMS;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers.HRMS;

[ApiController]
[Route("api/[controller]")]
public class GeofencesController(IGeofenceService geofenceService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetGeofences([FromQuery] GeofenceRequest request)
    {
        var result = await geofenceService.GetGeofencesAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await geofenceService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GeofenceRequest request)
    {
        var result = await geofenceService.CreateAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] GeofenceRequest request)
    {
        var result = await geofenceService.UpdateAsync(id, request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await geofenceService.DeleteAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }
}
