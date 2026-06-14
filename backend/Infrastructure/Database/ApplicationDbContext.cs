using System.Text.Json;
using Application.Common.Interfaces;
using Domain.Entities.Common;
using Domain.Entities.HRMS;
using Domain.Entities.UMS;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Database;

// 💡 Senior Tip: เปลี่ยนมาสืบทอดจาก IdentityDbContext<IdentityUser> เพื่อระบุระบบสมาชิกมาตรฐานให้กับ EF Core ทราบชัดเจน
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, int>
{
    private readonly ICurrentUserService _currentUserService;

    // คอนสตรัคเตอร์มาตรฐานสำหรับโปรเจกต์แยก Layer ยุค 2026 ปลอดภัยต่อเครื่องมือ CLI
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUserService)
        : base(options)
    {
        _currentUserService = currentUserService;
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

    // ── Audit Logging (Phase 4) ──────────────────────────────────────────────
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

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

        // ── AuditLog (Phase 4) ───────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs", "audit");
            entity.HasKey(a => a.Id);
            
            // FK to ApplicationUser
            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    // ── Audit Logging Override ───────────────────────────────────────────────
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        var auditEntries = new List<AuditLog>();
        var currentUserId = _currentUserService.UserId;

        // Iterate through all modified entities
        foreach (var entry in ChangeTracker.Entries())
        {
            // Skip AuditLogs themselves to prevent infinite loops, and skip unchanged/detached entities
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditLog
            {
                TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                UserId = currentUserId,
                Timestamp = DateTime.UtcNow
            };

            auditEntries.Add(auditEntry);

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();
            var affectedColumns = new List<string>();
            var primaryKey = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    // For generated IDs on insert, we can't get the value until after SaveChanges
                    continue; 
                }

                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    primaryKey[propertyName] = property.CurrentValue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.Action = "Insert";
                        newValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.Action = "Delete";
                        oldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditEntry.Action = "Update";
                            oldValues[propertyName] = property.OriginalValue;
                            newValues[propertyName] = property.CurrentValue;
                            affectedColumns.Add(propertyName);
                        }
                        break;
                }
            }

            auditEntry.OldValues = oldValues.Count == 0 ? null : JsonSerializer.Serialize(oldValues);
            auditEntry.NewValues = newValues.Count == 0 ? null : JsonSerializer.Serialize(newValues);
            auditEntry.AffectedColumns = affectedColumns.Count == 0 ? null : JsonSerializer.Serialize(affectedColumns);
            auditEntry.PrimaryKey = JsonSerializer.Serialize(primaryKey);
        }

        // Add the audit entries to the context
        foreach (var auditEntry in auditEntries)
        {
            AuditLogs.Add(auditEntry);
        }

        // Save both original changes and audit entries in a single transaction
        return await base.SaveChangesAsync(cancellationToken);
    }
}