using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces.HRMS;

public interface IAttendanceService
{
    /// <summary>
    /// Records a clock-in event. For Manual check-in the ImageUrl and Reason
    /// must be populated in <paramref name="request"/> before calling.
    /// </summary>
    Task<Response<AttendanceResponse>> ClockInAsync(ClockInRequest request);

    /// <summary>
    /// Stamps ClockOutTime on the employee's open attendance record for today.
    /// </summary>
    Task<Response<AttendanceResponse>> ClockOutAsync(ClockOutRequest request);

    /// <summary>
    /// Returns today's attendance record for the given employee, or null if
    /// the employee has not clocked in yet today.
    /// </summary>
    Task<Response<AttendanceResponse?>> GetTodayAttendanceAsync(Guid employeeId);
}
