using Application.Common.Models;

namespace Application.Dtos.HRMS;

public class GeofenceRequest : PaginationRequest
{
    public string? Name { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public double? RadiusInMeters { get; set; }
    public bool IsActive { get; set; } = true;
}
