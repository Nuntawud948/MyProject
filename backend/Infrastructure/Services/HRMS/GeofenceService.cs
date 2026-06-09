using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Application.Mappers.hrms.geofence;

namespace Infrastructure.Services.Hrms;

public class GeofenceService(
    ApplicationDbContext context,
    IFilterService filterService,
    ISortService sortService,
    IPaginationService paginationService
) : IGeofenceService
{
    public async Task<Response<PaginationResponse<GeofenceResponse>>> GetGeofencesAsync(GeofenceRequest request)
    {
        try
        {
            IQueryable<Geofence> query = context.Geofences
                .AsNoTracking()
                .Where(g => g.IsActive);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = request.Search.ToLower();
                query = query.Where(g => g.Name.ToLower().Contains(keyword));
            }

            query = filterService.ApplyStringFilter(query, g => g.Name, request.Name);

            query = sortService.ApplySort(
                query,
                request.SortBy,
                request.SortDirection,
                "Name"
            );

            var pagedEntities = await paginationService.PaginateAsync(
                query,
                request.PageNumber,
                request.PageSize
            );

            var geofenceList = GeofenceMapper.Instance.MapToResponseList(pagedEntities.Items);

            var paginationResult = new PaginationResponse<GeofenceResponse>(
                geofenceList,
                pagedEntities.PageNumber,
                pagedEntities.PageSize,
                pagedEntities.TotalRecords
            );

            return new Response<PaginationResponse<GeofenceResponse>>
            {
                IsSuccess = true,
                Data = paginationResult,
                Message = "Paged geofences retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<GeofenceResponse>>
            {
                IsSuccess = false,
                Data = null,
                Message = "An error occurred while retrieving geofences.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<GeofenceResponse>> GetByIdAsync(int id)
    {
        try
        {
            var geofence = await context.Geofences.AsNoTracking().FirstOrDefaultAsync(g => g.Id == id);
            if (geofence == null)
            {
                return new Response<GeofenceResponse> { IsSuccess = false, Message = "Geofence not found." };
            }

            var res = GeofenceMapper.Instance.MapToResponse(geofence);
            return new Response<GeofenceResponse> { IsSuccess = true, Data = res };
        }
        catch (Exception ex)
        {
            return new Response<GeofenceResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<GeofenceResponse>> CreateAsync(GeofenceRequest request)
    {
        try
        {
            var entity = GeofenceMapper.Instance.MapToEntity(request);
            
            context.Geofences.Add(entity);
            await context.SaveChangesAsync();

            var res = GeofenceMapper.Instance.MapToResponse(entity);

            return new Response<GeofenceResponse>
            {
                IsSuccess = true,
                Data = res,
                Message = "Geofence created successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<GeofenceResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<GeofenceResponse>> UpdateAsync(int id, GeofenceRequest request)
    {
        try
        {
            var geofence = await context.Geofences.FirstOrDefaultAsync(g => g.Id == id);
            if (geofence == null)
            {
                return new Response<GeofenceResponse> { IsSuccess = false, Message = "Geofence not found." };
            }

            GeofenceMapper.Instance.UpdateEntity(request, geofence);
            geofence.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            var res = GeofenceMapper.Instance.MapToResponse(geofence);

            return new Response<GeofenceResponse>
            {
                IsSuccess = true,
                Data = res,
                Message = "Geofence updated successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<GeofenceResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<bool>> DeleteAsync(int id)
    {
        try
        {
            var geofence = await context.Geofences.FirstOrDefaultAsync(g => g.Id == id);
            if (geofence == null)
            {
                return new Response<bool> { IsSuccess = false, Message = "Geofence not found.", Data = false };
            }

            geofence.IsActive = false; // Soft delete
            geofence.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return new Response<bool> { IsSuccess = true, Data = true, Message = "Geofence soft-deleted successfully." };
        }
        catch (Exception ex)
        {
            return new Response<bool> { IsSuccess = false, Message = ex.Message, Data = false };
        }
    }
}
