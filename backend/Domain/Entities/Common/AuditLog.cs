namespace Domain.Entities.Common;

/// <summary>
/// Entity for tracking data changes (Audit Logging)
/// Does not inherit from BaseEntity to avoid recursive auditing
/// </summary>
public class AuditLog
{
    public int Id { get; set; }
    
    // Links to AspNetUsers table in Infrastructure layer
    public int? UserId { get; set; }
    
    public string TableName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // "Insert", "Update", "Delete"
    public string? OldValues { get; set; } // JSON string
    public string? NewValues { get; set; } // JSON string
    public string? AffectedColumns { get; set; } // JSON string
    public string PrimaryKey { get; set; } = string.Empty; // JSON string
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
