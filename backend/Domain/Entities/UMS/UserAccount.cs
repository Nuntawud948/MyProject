using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common;
using Domain.Entities.HRMS;

namespace Domain.Entities.UMS; // 👈 เปลียน Namespace เป็นกลุ่ม UMS คลีนๆ

public class UserAccount : BaseEntity
{
    // ❌ ลบ Id, IsActive, CreatedAt ทิ้งได้เลย เพราะดึงมาจาก BaseEntity แล้ว
    
    // 🔴 ข้อมูลสำหรับการ Login
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    // 🟢 สิทธิ์การเข้าใช้งานระบบเว็บ (เชื่อมโยงไปยังตาราง Role ในระบบ HRMS)
    public int? RoleId { get; set; }
    [ForeignKey(nameof(RoleId))]
    public Role? Role { get; set; }

    // 💡 (Optional) ฟิลด์แนะนำเพิ่มเติมสำหรับทำระบบ Login สมัยใหม่
    // ถ้ายังไม่อยากเพิ่มตอนนี้ สามารถคอมเมนต์ไว้ก่อนได้ครับ
    public DateTime? LastLoginDate { get; set; } 
    public string? RefreshToken { get; set; } 
    public DateTime? RefreshTokenExpiryTime { get; set; } 

    // 🔗 เชื่อมโยงข้อมูลพนักงาน (Employee)
    public int? EmployeeId { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
