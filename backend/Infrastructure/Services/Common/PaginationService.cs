using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Common;

public class PaginationService : IPaginationService
{
    public async Task<PaginationResponse<TEntity>> PaginateAsync<TEntity>(
        IQueryable<TEntity> query,
        int pageNumber,
        int pageSize
    )
    {
        pageNumber = pageNumber < 1 ? 1 : pageNumber;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var totalCount = await query.CountAsync();
        var skip = (pageNumber - 1) * pageSize;

        // ดึงรายการข้อมูลดิบ (Entities) ออกมาจาก PostgreSQL
        var items = await query.Skip(skip).Take(pageSize).ToListAsync();

        return new PaginationResponse<TEntity>(items, pageNumber, pageSize, totalCount);
    }
}
