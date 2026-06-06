using Application.Common.Interfaces.HRMS;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Hrms;

/// <summary>
/// Attendance service — handles clock-in/out and today's status queries.
/// Image processing happens upstream in the Web controller before this service
/// is called; this service receives only the persisted <c>ImageUrl</c> string.
/// </summary>
public class AttendanceService(ApplicationDbContext context) : IAttendanceService
{
    // ── Clock-In ────────────────────────────────────────────────────────────

    public async Task<Response<AttendanceResponse>> ClockInAsync(ClockInRequest request)
    {
        try
        {
            // Validate: Manual check-in requires both a reason and an image
            if (request.CheckInMethod == "Manual")
            {
                if (string.IsNullOrWhiteSpace(request.Reason))
                    return Response<AttendanceResponse>.Failure(
                        "A reason is required for Manual check-in.");

                if (string.IsNullOrWhiteSpace(request.ImageUrl))
                    return Response<AttendanceResponse>.Failure(
                        "A photo is required for Manual check-in.");
            }

            // Prevent duplicate clock-in for today
            var todayUtc = DateTime.UtcNow.Date;
            var existing = await context.Attendances
                .AsNoTracking()
                .Where(a =>
                    a.EmployeeId == request.EmployeeId &&
                    a.ClockInTime.UtcDateTime.Date == todayUtc)
                .FirstOrDefaultAsync();

            if (existing != null)
                return Response<AttendanceResponse>.Failure(
                    "Employee has already clocked in today.");

            var entity = new Attendance
            {
                EmployeeId      = request.EmployeeId,
                ClockInTime     = DateTimeOffset.UtcNow,
                Latitude        = request.Latitude,
                Longitude       = request.Longitude,
                CheckInMethod   = request.CheckInMethod,
                Reason          = request.Reason,
                ImageUrl        = request.ImageUrl,
                // Auto check-ins are pre-approved; Manual require manager review
                IsApproved      = request.CheckInMethod == "Auto",
                CreatedAt       = DateTime.UtcNow,
            };

            context.Attendances.Add(entity);
            await context.SaveChangesAsync();

            return Response<AttendanceResponse>.Success(
                MapToResponse(entity), "Clocked in successfully.");
        }
        catch (Exception ex)
        {
            return Response<AttendanceResponse>.Failure(
                "An error occurred during clock-in.",
                new List<string> { ex.Message });
        }
    }

    // ── Clock-Out ────────────────────────────────────────────────────────────

    public async Task<Response<AttendanceResponse>> ClockOutAsync(ClockOutRequest request)
    {
        try
        {
            var todayUtc = DateTime.UtcNow.Date;

            var entity = await context.Attendances
                .Where(a =>
                    a.EmployeeId == request.EmployeeId &&
                    a.ClockInTime.UtcDateTime.Date == todayUtc &&
                    a.ClockOutTime == null)
                .FirstOrDefaultAsync();

            if (entity == null)
                return Response<AttendanceResponse>.Failure(
                    "No open attendance record found for today. Please clock in first.");

            entity.ClockOutTime = DateTimeOffset.UtcNow;
            entity.UpdatedAt    = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Response<AttendanceResponse>.Success(
                MapToResponse(entity), "Clocked out successfully.");
        }
        catch (Exception ex)
        {
            return Response<AttendanceResponse>.Failure(
                "An error occurred during clock-out.",
                new List<string> { ex.Message });
        }
    }

    // ── Today's Status ───────────────────────────────────────────────────────

    public async Task<Response<AttendanceResponse?>> GetTodayAttendanceAsync(Guid employeeId)
    {
        try
        {
            var todayUtc = DateTime.UtcNow.Date;

            var entity = await context.Attendances
                .AsNoTracking()
                .Where(a =>
                    a.EmployeeId == employeeId &&
                    a.ClockInTime.UtcDateTime.Date == todayUtc)
                .FirstOrDefaultAsync();

            if (entity == null)
                return new Response<AttendanceResponse?>
                {
                    IsSuccess = true,
                    Data      = null,
                    Message   = "No attendance record found for today.",
                };

            return Response<AttendanceResponse?>.Success(
                MapToResponse(entity), "Today's attendance retrieved successfully.");
        }
        catch (Exception ex)
        {
            return Response<AttendanceResponse?>.Failure(
                "An error occurred while retrieving today's attendance.",
                new List<string> { ex.Message });
        }
    }

    // ── Private Mapper ───────────────────────────────────────────────────────

    private static AttendanceResponse MapToResponse(Attendance a) => new()
    {
        Id            = a.Id,
        EmployeeId    = a.EmployeeId,
        ClockInTime   = a.ClockInTime,
        ClockOutTime  = a.ClockOutTime,
        Latitude      = a.Latitude,
        Longitude     = a.Longitude,
        CheckInMethod = a.CheckInMethod,
        ImageUrl      = a.ImageUrl,
        Reason        = a.Reason,
        IsApproved    = a.IsApproved,
        CreatedAt     = a.CreatedAt,
        UpdatedAt     = a.UpdatedAt,
    };
}
