using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces.HRMS;

public interface IGeofenceService
{
    Task<Response<PaginationResponse<GeofenceResponse>>> GetGeofencesAsync(GeofenceRequest request);
    Task<Response<GeofenceResponse>> GetByIdAsync(int id);
    Task<Response<GeofenceResponse>> CreateAsync(GeofenceRequest request);
    Task<Response<GeofenceResponse>> UpdateAsync(int id, GeofenceRequest request);
    Task<Response<bool>> DeleteAsync(int id);
}
