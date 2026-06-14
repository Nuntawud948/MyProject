using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;

namespace Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiagnosticsController(ILogger<DiagnosticsController> logger) : ControllerBase
{
    // GET api/diagnostics/test-log
    [HttpGet("test-log")]
    public IActionResult TestLog()
    {
        logger.LogInformation("Test log entry created at {Time} for User {UserId}", DateTime.UtcNow, "anonymous");
        return Ok(new { Message = "Information log has been recorded successfully." });
    }

    // GET api/diagnostics/test-error
    [HttpGet("test-error")]
    public IActionResult TestError()
    {
        try
        {
            // Simulate a failure
            throw new InvalidOperationException("This is a simulated exception for testing ELK logging.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred during the test operation.");
            return StatusCode(500, new { Message = "Error log has been recorded successfully.", Error = ex.Message });
        }
    }
}
