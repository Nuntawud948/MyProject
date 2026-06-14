using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Sinks.Elasticsearch;
using System;

namespace Web.Extensions;

public static class SerilogExtensions
{
    public static WebApplicationBuilder AddApplicationSerilog(this WebApplicationBuilder builder)
    {
        // 1. Clear default logging providers
        builder.Logging.ClearProviders();

        // 2. Read ElasticSearch URI from configuration
        var elasticUri = builder.Configuration["ElasticSearch:Uri"] ?? "http://localhost:9200";

        // 3. Configure Serilog Logger
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration) // Reads Serilog:MinimumLevel overrides
            .Enrich.FromLogContext()
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} <s:{SourceContext}>{NewLine}{Exception}")
            .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(elasticUri))
            {
                // Auto-generate daily rolling index names: hrms-logs-2026.06.14
                IndexFormat = "hrms-logs-{0:yyyy.MM.dd}",
                AutoRegisterTemplate = true,
                AutoRegisterTemplateVersion = AutoRegisterTemplateVersion.ESv8,
                
                // Note on ILM (Index Lifecycle Management): 
                // To delete indices older than 30 days, ILM should be configured in the Elasticsearch cluster.
                // The sink can create indices, but ILM policies (like deleting after 30 days) are an ES server-side concern.
                
                // Additional stability options
                EmitEventFailure = EmitEventFailureHandling.WriteToSelfLog |
                                   EmitEventFailureHandling.WriteToFailureSink |
                                   EmitEventFailureHandling.RaiseCallback,
                FailureCallback = (e, ex) => Console.WriteLine($"Unable to submit event to Elasticsearch: {ex?.Message}")
            })
            .CreateLogger();

        // 4. Hook Serilog into the ASP.NET Core host
        builder.Host.UseSerilog();

        return builder;
    }
}
