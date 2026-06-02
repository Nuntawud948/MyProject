using Domain.Entities.HRMS;
using Domain.Entities.UMS;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Database;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    // กำหนดตารางที่จะให้สร้างใน Database
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<BusinessUnit> BusinessUnits => Set<BusinessUnit>();

    public DbSet<UserAccount> UserAccounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("public");

        // กำหนด Schema และชื่อตารางให้ดูเป็นระเบียบแบบ Enterprise
        modelBuilder.Entity<Employee>().ToTable("Employees", "hrms");
        modelBuilder.Entity<Department>().ToTable("Departments", "hrms");
        modelBuilder.Entity<Role>().ToTable("Roles", "hrms");
        modelBuilder.Entity<BusinessUnit>().ToTable("BusinessUnits", "hrms");

        modelBuilder.Entity<UserAccount>().ToTable("UserAccounts", "ums");

        // กำหนดความสัมพันธ์ระหว่าง Employee และ UserAccount ให้แยกจากกันอย่างชัดเจน เพื่อป้องกัน EF Core สับสนกับ CreatedBy/UpdatedBy
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.UserAccount)
            .WithMany()
            .HasForeignKey(e => e.UserAccountId);

        modelBuilder.Entity<UserAccount>()
            .HasOne(u => u.Employee)
            .WithMany()
            .HasForeignKey(u => u.EmployeeId);

        // กำหนดความสัมพันธ์ระหว่าง UserAccount และ Role ให้แยกจากกันอย่างชัดเจน เพื่อป้องกัน EF Core สับสนกับ CreatedBy/UpdatedBy
        modelBuilder.Entity<UserAccount>()
            .HasOne(u => u.Role)
            .WithMany()
            .HasForeignKey(u => u.RoleId);
    }
}
