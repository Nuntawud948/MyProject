using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Web.HealthChecks;

public static class HealthCheckResponseWriter
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static async Task WriteAsync(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            Status = report.Status.ToString(),
            TotalDuration = report.TotalDuration.ToString(),
            Components = report.Entries.ToDictionary(
                entry => entry.Key,
                entry => new
                {
                    Status = entry.Value.Status.ToString(),
                    Duration = entry.Value.Duration.ToString(),
                    Description = entry.Value.Description,
                    Exception = entry.Value.Exception?.Message
                })
        };

        var json = JsonSerializer.Serialize(response, Options);
        await context.Response.WriteAsync(json);
    }
}
