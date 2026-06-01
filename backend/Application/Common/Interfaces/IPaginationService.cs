using Application.Common.Models;

namespace Application.Common.Interfaces;

public interface IPaginationService
{
    // ปรับให้ส่งกลับเป็น PaginationResponse ของ Entity ดิบตัวเหล็กตรงๆ จาก Database
    Task<PaginationResponse<TEntity>> PaginateAsync<TEntity>(
        IQueryable<TEntity> query,
        int pageNumber,
        int pageSize
    );
}
