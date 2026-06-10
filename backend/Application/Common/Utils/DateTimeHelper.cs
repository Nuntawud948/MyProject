using System;

namespace Application.Common.Utils;

public static class DateTimeHelper
{
    public static Tuple<DateTime, DateTime> GetThailandTodayUtcBoundaries()
    {
        // Use local server time
        var localStart = DateTime.Today; // 00:00:00 local time
        var localEnd = localStart.AddDays(1); // 00:00:00 local time tomorrow

        return Tuple.Create(localStart, localEnd);
    }

    public static DateTime? EnsureUtc(DateTime? date)
    {
        if (date == null) return null;
        // Treat unspecified as Local time
        return date.Value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(date.Value, DateTimeKind.Local)
            : date.Value.ToLocalTime();
    }

    public static DateTime EnsureUtc(DateTime date)
    {
        // Treat unspecified as Local time
        return date.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(date, DateTimeKind.Local)
            : date.ToLocalTime();
    }
}
