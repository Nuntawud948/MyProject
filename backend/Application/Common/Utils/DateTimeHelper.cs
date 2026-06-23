using System;

namespace Application.Common.Utils;

public static class DateTimeHelper
{
    public static DateTime GetThaiNow()
    {
        try
        {
            var thaiZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, thaiZone);
        }
        catch (TimeZoneNotFoundException)
        {
            var thaiZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, thaiZone);
        }
    }

    public static Tuple<DateTime, DateTime> GetThailandTodayUtcBoundaries()
    {
        var thaiNow = GetThaiNow();
        var localStart = thaiNow.Date; // 00:00:00 Thai time today
        var localEnd = localStart.AddDays(1); // 00:00:00 Thai time tomorrow

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
