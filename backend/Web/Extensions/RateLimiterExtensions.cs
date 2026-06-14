using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;

namespace Web.Extensions;

public static class RateLimiterExtensions
{
    public static IServiceCollection AddApplicationRateLimiter(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // Custom response on limit exceeded
            options.OnRejected = async (context, token) =>
            {
                var response = context.HttpContext.Response;
                response.StatusCode = StatusCodes.Status429TooManyRequests;
                response.ContentType = "application/json";
                
                // HTTP Standard Retry-After Header (in seconds)
                response.Headers.RetryAfter = "60";

                var responsePayload = new
                {
                    IsSuccess = false,
                    Message = "Too many requests. Please try again later.",
                    RetryAfterSeconds = 60
                };

                await response.WriteAsJsonAsync(responsePayload, cancellationToken: token);
            };

            // Policy 1: LoginPolicy - Fixed Window, Limit to 5 requests per 1 minute per IP
            options.AddPolicy("LoginPolicy", context =>
            {
                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown-ip";
                return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                });
            });

            // Policy 2: CheckInPolicy - Fixed Window, Limit to 3 requests per 1 minute per IP
            options.AddPolicy("CheckInPolicy", context =>
            {
                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown-ip";
                return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 3,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                });
            });
        });

        return services;
    }
}
