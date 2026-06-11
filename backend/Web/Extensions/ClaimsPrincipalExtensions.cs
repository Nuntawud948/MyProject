using System.Security.Claims;

namespace Web.Extensions; // เปลี่ยน namespace ตามโครงสร้างโปรเจกต์ของคุณ

public static class ClaimsPrincipalExtensions
{
    // 💡 ฟังก์ชันช่วยดึงรหัสพนักงาน (EmployeeId) ออกมาจาก JWT Token
    public static int? GetEmployeeId(this ClaimsPrincipal user)
    {
        // ค้นหา Claim ที่ชื่อ "EmployeeId" (ที่เราฝังไว้ตอน Login)
        var employeeIdClaim = user.FindFirst("EmployeeId")?.Value;
        
        // แปลงจากข้อความ (String) กลับเป็นตัวเลข (Int)
        if (int.TryParse(employeeIdClaim, out int employeeId))
        {
            return employeeId;
        }
        
        return null; // ถ้าไม่มีหรือแปลงไม่ได้ ให้คืนค่าว่าง
    }

    // (แถม) เผื่ออยากดึง Username มาใช้
    public static string? GetUsername(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Name)?.Value;
    }
}