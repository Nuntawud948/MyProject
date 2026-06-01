namespace Application.Common.Interfaces;

public interface ISortService
{
    // รับชื่อคอลัมน์จากหน้าบ้าน แล้วใช้ Expression Tree ไปสั่ง OrderBy ในฐานข้อมูลจริง
    IQueryable<T> ApplySort<T>(IQueryable<T> query, string? sortBy, string? sortDirection, string defaultSortBy);
}