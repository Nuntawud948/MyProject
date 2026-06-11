using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Database;

// 💡 2. สร้าง Role ที่ใช้ Id เป็นตัวเลข
public class ApplicationRole : IdentityRole<int>
{
    public ApplicationRole() : base() { }
    public ApplicationRole(string roleName) : base(roleName) { }
}