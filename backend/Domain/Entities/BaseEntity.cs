namespace Domain.Common;
using Domain.Entities.UMS; // สมมติว่าดึงมาจากโฟลเดอร์ระบบ UMS (ตาราง User)

public abstract class BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; 
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public int? CreatedById { get; set; }
    public int? UpdatedById { get; set; }

    protected BaseEntity()
    {
        IsActive = true;
        CreatedAt = DateTime.UtcNow; // ใช้ UTC มาตรฐานสากล
    }
}