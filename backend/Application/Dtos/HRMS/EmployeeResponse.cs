using Domain.Entities.HRMS;

namespace Application.Dtos.HRMS;

// ส่งข้อมูลที่ถูกปรุงสุกแล้วกลับไปให้ React แสดงผล
public class EmployeeResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string Position { get; set; } = null!;

    public DateTime StartDate { get; set; } // 👈 เปลี่ยนจาก JoinedDate    public int ServiceYears { get; set; } // คำนวณอายุงานมาให้เลย

    public bool IsActive { get; set; } // แปลง bool เป็น "Active" / "Inactive"
    public string? PhoneNumber { get; set; } // 👈 เพิ่มเข้ามาใหม่
    public DateTime? ResignationDate { get; set; } // 👈 เพิ่มเข้ามาใหม่

 
   
    
}