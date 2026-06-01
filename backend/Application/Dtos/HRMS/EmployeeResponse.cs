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
}