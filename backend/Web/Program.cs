using System.Text;
using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Infrastructure.Database;
using Infrastructure.Services.Auth;
using Infrastructure.Services.Common;
using Infrastructure.Services.Hrms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using StackExchange.Redis;
using Web.Extensions;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Bootstrap Serilog
builder.AddApplicationSerilog();


var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[] { };

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); 
    });
});


builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => 
        {
            // รวมคอนฟิกทั้งสองอย่างไว้ในบล็อกเดียวกันอย่างถูกต้องตามสไตล์ Senior
            npgsqlOptions.MigrationsAssembly("Infrastructure");
            npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
        }
    ));

// =========================================================================
// 3. ระบบ Identity Core & Authentication (เพิ่มใหม่สำหรับสเต็ป 1.1 & 1.2)
// =========================================================================
// 3.1 เพิ่ม Microsoft Identity Services บังคับระดับความปลอดภัยรหัสผ่าน
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 3.2 ตั้งค่าระบบตรวจสอบสิทธิ์ผ่าน JWT Bearer Token เพื่อส่งสิทธิ์ไปหา React หน้าบ้าน
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "YourSuperSecretKeyThatIsLongEnough2026Enterprise!"; 

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "MyProjectBackend",
        ValidAudience = jwtSettings["Audience"] ?? "MyProjectFrontend",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero // ป้องกันเวลาเลื่อมล้ำ เพื่อให้ Token หมดอายุตรงเป้าทันที ปลอดภัยสูงสุด
    };
});

// =========================================================================
// 4. DI Services Registration & Performance/Audit
// =========================================================================
builder.Services.AddHttpContextAccessor();

// 4.1 Setup Redis Caching
var redisConnectionString = builder.Configuration.GetSection("Redis")["ConnectionString"] ?? "localhost:6379";
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
    options.InstanceName = "MyProject_";
});
// Register IConnectionMultiplexer for advanced Redis operations (e.g., prefix deletion)
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
    ConnectionMultiplexer.Connect(redisConnectionString));

builder.Services.AddApplicationServices();

// =========================================================================
// 5. Controller & OpenAPI / Swagger & Health / Rate Limiter Services
// =========================================================================
builder.Services.AddApplicationHealthChecks(builder.Configuration);
builder.Services.AddApplicationRateLimiter();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// =========================================================================
// 6. HTTP Request Pipeline (Middleware)
// =========================================================================
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("EnableSwagger"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();
app.UseStaticFiles();

// เปิดใช้งาน CORS ก่อนทำการ Auth
app.UseCors("CorsPolicy");

// Rate limiting must run before routing authentication
app.UseRateLimiter();

// 💡 Senior Tip: ลำดับ Middleware ตรงนี้สำคัญมากใน .NET! 
// ต้องเรียกใช้ Authentication (ตรวจป้าย) ก่อน Authorization (เช็คสิทธิ์ทำ) เสมอ
app.UseAuthentication(); 
app.UseAuthorization();

app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = Web.HealthChecks.HealthCheckResponseWriter.WriteAsync
});

app.MapControllers();

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}