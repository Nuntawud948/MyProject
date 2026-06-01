using Microsoft.EntityFrameworkCore;
using Domain.Entities.Hrms;

namespace Infrastructure.Database;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    // กำหนดตารางที่จะให้สร้างใน Database
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // กำหนด Schema และชื่อตารางให้ดูเป็นระเบียบแบบ Enterprise
        modelBuilder.Entity<Employee>().ToTable("Employees", "hrms");
    }
}