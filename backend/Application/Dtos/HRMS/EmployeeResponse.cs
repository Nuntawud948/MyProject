using Domain.Entities.Hrms;

namespace Application.Dtos.Hrms;

// ส่งข้อมูลที่ถูกปรุงสุกแล้วกลับไปให้ React แสดงผล
public class EmployeeResponse
{
    public int Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty; // รวม First+Last Name
    public string Department { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public int ServiceYears { get; set; } // คำนวณอายุงานมาให้เลย
    public string Status { get; set; } = string.Empty; // แปลง bool เป็น "Active" / "Inactive"

    // 🌟 สมองกลย่อยสำหรับแปลงร่าง Entity ดิบให้กลายเป็น DTO ปรุงสุก
    public static EmployeeResponse MapFromEntity(Employee entity)
    {
        return new EmployeeResponse
        {
            Id = entity.Id,
            EmployeeCode = entity.EmployeeCode,
            FullName = $"{entity.FirstName} {entity.LastName}",
            Department = entity.Department ?? "ยังไม่ระบุแผนก",
            StartDate = entity.StartDate,
            Status = entity.IsActive ? "Active" : "Inactive",
            ServiceYears = DateTime.Now.Year - entity.StartDate.Year,
        };
    }
}
