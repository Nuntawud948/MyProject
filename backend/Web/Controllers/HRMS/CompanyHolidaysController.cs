using Application.Common.Interfaces.HRMS;
using Application.Dtos.HRMS;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers.HRMS;

[ApiController]
[Route("api/[controller]")]
public class CompanyHolidaysController(ICompanyHolidayService holidayService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCompanyHolidays([FromQuery] CompanyHolidayRequest request)
    {
        var result = await holidayService.GetCompanyHolidaysAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("year/{year:int}")]
    public async Task<IActionResult> GetByYear(int year)
    {
        var result = await holidayService.GetByYearAsync(year);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await holidayService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CompanyHolidayFormDto request)
    {
        var result = await holidayService.CreateAsync(request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyHolidayFormDto request)
    {
        var result = await holidayService.UpdateAsync(id, request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await holidayService.DeleteAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }
}
