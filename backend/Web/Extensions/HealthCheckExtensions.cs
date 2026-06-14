using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Web.Extensions;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddApplicationHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddHealthChecks()
            .AddNpgSql(
                connectionString: connectionString ?? string.Empty,
                name: "postgresql",
                tags: new[] { "db", "ready" });

        return services;
    }
}
