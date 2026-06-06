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

    // ── Leave Management ─────────────────────────────────────────────────────
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();

    // ── Attendance (Phase 1) ─────────────────────────────────────────────────
    public DbSet<Attendance> Attendances => Set<Attendance>();

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

        // ── Leave Management — Table Schema ──────────────────────────────────
        modelBuilder.Entity<LeaveType>().ToTable("LeaveTypes", "hrms");
        modelBuilder.Entity<LeaveBalance>().ToTable("LeaveBalances", "hrms");
        modelBuilder.Entity<LeaveRequest>().ToTable("LeaveRequests", "hrms");

        // ── Attendance — Table Schema & Column Constraints ────────────────────
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.ToTable("Attendances", "hrms");
            entity.HasKey(a => a.Id);

            // GPS coordinates stored at decimal(9,6) per spec
            entity.Property(a => a.Latitude)
                  .HasPrecision(9, 6);
            entity.Property(a => a.Longitude)
                  .HasPrecision(9, 6);

            // Bounded string columns
            entity.Property(a => a.CheckInMethod).HasMaxLength(10);
            entity.Property(a => a.ImageUrl).HasMaxLength(500);
            entity.Property(a => a.Reason).HasMaxLength(1000);
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
