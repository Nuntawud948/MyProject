using Riok.Mapperly.Abstractions;
using Domain.Entities.HRMS;
using Application.Dtos.HRMS;

namespace Application.Mappers.hrms.geofence;

[Mapper]
public partial class GeofenceMapper
{
    public static readonly GeofenceMapper Instance = new();

    public partial GeofenceResponse MapToResponse(Geofence source);
    public partial List<GeofenceResponse> MapToResponseList(IEnumerable<Geofence> source);
    public partial Geofence MapToEntity(GeofenceRequest source);
    public partial void UpdateEntity(GeofenceRequest source, Geofence target);
}
