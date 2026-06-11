using Domain.Entities.HRMS; // ชี้ไปที่โฟลเดอร์เก็บ Employee ของคุณ
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Database;

public class ApplicationUser : IdentityUser<int>
{
    // Foreign Key เพื่อชี้ไปยังตารางพนักงาน
    public int? EmployeeId { get; set; } 

    // Navigation Property เพื่อให้ EF Core ดึงข้อมูลพนักงานมาพร้อมกันได้ (Relational)
    public Employee? Employee { get; set; } 
}