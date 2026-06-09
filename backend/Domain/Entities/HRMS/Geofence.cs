namespace Domain.Entities.HRMS;

using Domain.Common;

public class Geofence : BaseEntity
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public double RadiusInMeters { get; set; }
}
