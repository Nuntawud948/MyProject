namespace Domain.Common;

using System.ComponentModel.DataAnnotations.Schema;
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

    // 🔗 ลิงก์ไปหา UserAccount ที่เป็นคนสร้าง/แก้ไขข้อมูล
    [ForeignKey(nameof(CreatedById))]
    public UserAccount? CreatedByUser { get; set; } 
    [ForeignKey(nameof(UpdatedById))]   
    public UserAccount? UpdatedByUser { get; set; }
    
    protected BaseEntity()
    {
        IsActive = true;
        CreatedAt = DateTime.Now; // ใช้เวลา Local ของเซิร์ฟเวอร์
    }
}