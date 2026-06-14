using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Application.Mappers.hrms.companyHoliday;

namespace Infrastructure.Services.Hrms;

public class CompanyHolidayService(
    ApplicationDbContext context,
    IFilterService filterService,
    ISortService sortService,
    IPaginationService paginationService,
    ICacheService cacheService
) : ICompanyHolidayService
{
    private const string CachePrefix = "company-holidays";
    public async Task<Response<PaginationResponse<CompanyHolidayResponse>>> GetCompanyHolidaysAsync(
        CompanyHolidayRequest request
    )
    {
        try
        {
            IQueryable<CompanyHoliday> query = context.CompanyHolidays
                .AsNoTracking()
                .Where(h => h.IsActive);

            query = filterService.ApplyStringFilter(query, h => h.Name, request.Name);

            if (request.Year.HasValue)
            {
                query = query.Where(h => h.Year == request.Year.Value);
            }

            query = sortService.ApplySort(
                query,
                request.SortBy,
                request.SortDirection,
                "HolidayDate"
            );

            var pagedEntities = await paginationService.PaginateAsync(
                query,
                request.PageNumber,
                request.PageSize
            );

            var holidayList = CompanyHolidayMapper.Instance.MapToResponseList(pagedEntities.Items);

            var paginationResult = new PaginationResponse<CompanyHolidayResponse>(
                holidayList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords
            );

            return new Response<PaginationResponse<CompanyHolidayResponse>>
            {
                IsSuccess = true,
                Data = paginationResult,
                Message = "Paged company holidays retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<CompanyHolidayResponse>>
            {
                IsSuccess = false,
                Data = null,
                Message = "An error occurred while retrieving company holidays.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<List<CompanyHolidayResponse>>> GetByYearAsync(int year)
    {
        try
        {
            var cacheKey = $"{CachePrefix}:year:{year}";
            
            // 1. Try to get from Cache first
            var cachedHolidays = await cacheService.GetAsync<List<CompanyHolidayResponse>>(cacheKey);
            if (cachedHolidays != null)
            {
                return new Response<List<CompanyHolidayResponse>>
                {
                    IsSuccess = true,
                    Data = cachedHolidays,
                    Message = $"Company holidays for year {year} retrieved from cache successfully."
                };
            }

            // 2. If not found in cache, query the Database
            var holidays = await context.CompanyHolidays
                .AsNoTracking()
                .Where(h => h.IsActive && h.Year == year)
                .OrderBy(h => h.HolidayDate)
                .ToListAsync();

            var list = CompanyHolidayMapper.Instance.MapToResponseList(holidays);

            // 3. Save to Cache for future requests (e.g., expire in 1 hour)
            await cacheService.SetAsync(cacheKey, list, TimeSpan.FromHours(1));

            return new Response<List<CompanyHolidayResponse>>
            {
                IsSuccess = true,
                Data = list,
                Message = $"Company holidays for year {year} retrieved from database successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<List<CompanyHolidayResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving company holidays by year.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<CompanyHolidayFormDto>> GetByIdAsync(int id)
    {
        try
        {
            var holiday = await context.CompanyHolidays.AsNoTracking().FirstOrDefaultAsync(h => h.Id == id);
            if (holiday == null)
            {
                return new Response<CompanyHolidayFormDto> { IsSuccess = false, Message = "Company holiday not found." };
            }

            var dto = CompanyHolidayMapper.Instance.MapToFormDto(holiday);

            return new Response<CompanyHolidayFormDto> { IsSuccess = true, Data = dto };
        }
        catch (Exception ex)
        {
            return new Response<CompanyHolidayFormDto> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<CompanyHolidayFormDto>> CreateAsync(CompanyHolidayFormDto request)
    {
        try
        {
            var entity = CompanyHolidayMapper.Instance.MapToEntity(request);
            
            // BaseEntity requires Name to be set (HolidayName mapped to Name)
            entity.Name = request.Name;
            
            context.CompanyHolidays.Add(entity);
            await context.SaveChangesAsync();

            // Invalidate cache for all company holidays since data changed
            await cacheService.RemoveByPrefixAsync(CachePrefix);

            return new Response<CompanyHolidayFormDto>
            {
                IsSuccess = true,
                Data = request,
                Message = "Company holiday created successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<CompanyHolidayFormDto> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<CompanyHolidayResponse>> UpdateAsync(int id, CompanyHolidayFormDto request)
    {
        try
        {
            var holiday = await context.CompanyHolidays.FirstOrDefaultAsync(h => h.Id == id);
            if (holiday == null)
            {
                return new Response<CompanyHolidayResponse> { IsSuccess = false, Message = "Company holiday not found." };
            }

            CompanyHolidayMapper.Instance.UpdateEntity(request, holiday);
            holiday.Name = request.Name;

            await context.SaveChangesAsync();

            // Invalidate cache for all company holidays
            await cacheService.RemoveByPrefixAsync(CachePrefix);

            var res = CompanyHolidayMapper.Instance.MapToResponse(holiday);

            return new Response<CompanyHolidayResponse>
            {
                IsSuccess = true,
                Data = res,
                Message = "Company holiday updated successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<CompanyHolidayResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<bool>> DeleteAsync(int id)
    {
        try
        {
            var holiday = await context.CompanyHolidays.FirstOrDefaultAsync(h => h.Id == id);
            if (holiday == null)
            {
                return new Response<bool> { IsSuccess = false, Message = "Company holiday not found.", Data = false };
            }

            holiday.IsActive = false; // Soft delete
            await context.SaveChangesAsync();

            // Invalidate cache
            await cacheService.RemoveByPrefixAsync(CachePrefix);

            return new Response<bool> { IsSuccess = true, Data = true, Message = "Company holiday soft-deleted successfully." };
        }
        catch (Exception ex)
        {
            return new Response<bool> { IsSuccess = false, Message = ex.Message, Data = false };
        }
    }
}
