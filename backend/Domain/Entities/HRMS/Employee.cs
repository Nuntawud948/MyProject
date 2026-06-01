namespace Domain.Entities.Hrms;

public class Employee
{
    public int Id { get; set; }
    
    // 🔴 ฟิลด์บังคับ (ห้าม Null - Database จะเป็น NOT NULL)
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public bool IsActive { get; set; } = true;

    // 🟢 ฟิลด์ทางเลือก (ใส่ ? เพื่อบอกว่าเป็น Null ได้ - Database จะเป็น NULLABLE)
    public string? Department { get; set; }       // เผื่อพนักงานใหม่ยังไม่ได้จัดสรรแผนก
    public string? PhoneNumber { get; set; }      // เผื่อยังไม่กรอกเบอร์โทร
    public DateTime? ResignationDate { get; set; } // วันที่ลาออก (คนทำงานอยู่ก็ต้องเป็น Null)
}