using Domain.Entities.HRMS;
using Domain.Entities.UMS;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Database;

// 💡 Senior Tip: เปลี่ยนมาสืบทอดจาก IdentityDbContext<IdentityUser> เพื่อระบุระบบสมาชิกมาตรฐานให้กับ EF Core ทราบชัดเจน
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, int>
{
    // คอนสตรัคเตอร์มาตรฐานสำหรับโปรเจกต์แยก Layer ยุค 2026 ปลอดภัยต่อเครื่องมือ CLI
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // กำหนดตารางที่จะให้สร้างใน Database
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<BusinessUnit> BusinessUnits => Set<BusinessUnit>();

    // 💡 หากระบบลงทะเบียนของคุณใช้ IdentityUser เป็นหลัก 
    // ตัว UserAccount นี้สามารถใช้เป็นตาราง Profile เสริม หรือรักษาไว้สำหรับ Schema เดิมได้ตามโครงสร้างนี้
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();

    // ── Leave Management ─────────────────────────────────────────────────────
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();

    // ── Attendance (Phase 1) ─────────────────────────────────────────────────
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<CompanyHoliday> CompanyHolidays => Set<CompanyHoliday>();
    
    // ── Geofencing ───────────────────────────────────────────────────────────
    public DbSet<Geofence> Geofences => Set<Geofence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 💡 สำคัญที่สุด: ต้องเรียก base.OnModelCreating ก่อนเสมอ เพื่อให้ Identity สร้างตารางพื้นฐานขึ้นมาก่อน
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("public");

        // ย้ายตาราง Identity ลง Schema ums ตามเดิม (ไม่ต้องระบุ <string> แล้ว เพราะมันเป็น <int> อัตโนมัติ)
        modelBuilder.Entity<ApplicationUser>().ToTable("AspNetUsers", "ums");
        modelBuilder.Entity<ApplicationRole>().ToTable("AspNetRoles", "ums");
        modelBuilder.Entity<IdentityUserRole<int>>().ToTable("AspNetUserRoles", "ums");
        modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("AspNetUserClaims", "ums");
        modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("AspNetUserLogins", "ums");
        modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("AspNetRoleClaims", "ums");
        modelBuilder.Entity<IdentityUserToken<int>>().ToTable("AspNetUserTokens", "ums");

        // กำหนด Schema และชื่อตารางให้ดูเป็นระเบียบแบบ Enterprise
        modelBuilder.Entity<Employee>().ToTable("Employees", "hrms");
        modelBuilder.Entity<Department>().ToTable("Departments", "hrms");
        modelBuilder.Entity<Role>().ToTable("Roles", "hrms");
        modelBuilder.Entity<BusinessUnit>().ToTable("BusinessUnits", "hrms");
        
        modelBuilder.Entity<CompanyHoliday>(entity =>
        {
            entity.ToTable("CompanyHolidays", "hrms");
            entity.Property(h => h.Description).HasMaxLength(500);
            entity.HasIndex(h => h.Year);
        });

        modelBuilder.Entity<UserAccount>().ToTable("UserAccounts", "ums");

        // กำหนดความสัมพันธ์ระหว่าง Employee และ UserAccount
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.UserAccount)
            .WithMany()
            .HasForeignKey(e => e.UserAccountId);

        modelBuilder.Entity<UserAccount>()
            .HasOne(u => u.Employee)
            .WithMany()
            .HasForeignKey(u => u.EmployeeId);

        modelBuilder.Entity<UserAccount>()
            .HasOne(u => u.Role)
            .WithMany()
            .HasForeignKey(u => u.RoleId);
        
        modelBuilder.Entity<ApplicationUser>()
            .HasOne(u => u.Employee)
            .WithMany()
            .HasForeignKey(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Leave Management — Table Schema ──────────────────────────────────
        modelBuilder.Entity<LeaveType>().ToTable("LeaveTypes", "hrms");
        modelBuilder.Entity<LeaveBalance>().ToTable("LeaveBalances", "hrms");
        modelBuilder.Entity<LeaveRequest>().ToTable("LeaveRequests", "hrms");

        // ── Attendance — Table Schema & Column Constraints ────────────────────
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.ToTable("Attendances", "hrms");
            entity.HasKey(a => a.Id);

            entity.Property(a => a.Latitude).HasPrecision(9, 6);
            entity.Property(a => a.Longitude).HasPrecision(9, 6);
            entity.Property(a => a.CheckInMethod).HasMaxLength(10);
            entity.Property(a => a.ImageUrl).HasMaxLength(500);
            entity.Property(a => a.Reason).HasMaxLength(1000);
        });

        // ── Geofencing — Table Schema & Column Constraints ─────────────────────
        modelBuilder.Entity<Geofence>(entity =>
        {
            entity.ToTable("Geofences", "hrms");
            entity.HasKey(g => g.Id);

            entity.Property(g => g.Latitude).HasPrecision(9, 6);
            entity.Property(g => g.Longitude).HasPrecision(9, 6);
        });

        // ── LeaveBalance Relationships (Restrict to avoid cascade cycles) ────
        modelBuilder.Entity<LeaveBalance>()
            .HasOne(lb => lb.Employee)
            .WithMany()
            .HasForeignKey(lb => lb.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveBalance>()
            .HasOne(lb => lb.LeaveType)
            .WithMany()
            .HasForeignKey(lb => lb.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── LeaveRequest Relationships (Restrict to avoid cascade cycles) ────
        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.Employee)
            .WithMany()
            .HasForeignKey(lr => lr.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.LeaveType)
            .WithMany()
            .HasForeignKey(lr => lr.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.FirstApprover)
            .WithMany()
            .HasForeignKey(lr => lr.FirstApproverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.SecondApprover)
            .WithMany()
            .HasForeignKey(lr => lr.SecondApproverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}