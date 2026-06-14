using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Infrastructure.Services.Auth;
using Infrastructure.Services.Common;
using Infrastructure.Services.Hrms;
using Microsoft.Extensions.DependencyInjection;

namespace Web.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IFilterService, FilterService>();
        services.AddScoped<ISortService, SortService>();
        services.AddScoped<IPaginationService, PaginationService>();

        // ── Leave Management
        services.AddScoped<ILeaveService, LeaveService>();

        // ── Attendance (Phase 1)
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ICompanyHolidayService, CompanyHolidayService>();
        services.AddScoped<IGeofenceService, GeofenceService>();
        services.AddSingleton<IImageService, ImageService>();

        // ── Common Services & Performance/Audit
        services.AddSingleton<ICacheService, CacheService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // ── User Management System & Auth
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
