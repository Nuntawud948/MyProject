using Application.Common.Interfaces;
using Infrastructure.Database;
using Infrastructure.Services.Auth;
using Infrastructure.Services.Common;
using Infrastructure.Services.Hrms;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. ตั้งค่า CORS (อนุญาตให้ React พอร์ต 5173 ยิง API เข้ามาได้)
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFrontend",
        policy =>
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
    );
});

// 2. เชื่อมต่อ PostgreSQL และบังคับให้ตาราง History อยู่ที่ public schema
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "public") // 👈 ระบุชื่อตาราง และชื่อ Schema ชัดเจน
    )
);

// 3. ลงทะเบียน Service (บอกระบบว่าถ้ามีคนขอ IEmployeeService ให้เรียกใช้ EmployeeService)
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IFilterService, FilterService>();
builder.Services.AddScoped<ISortService, SortService>();
builder.Services.AddScoped<IPaginationService, PaginationService>();

// ลงทะเบียนระบบสิทธิ์และยืนยันตัวตน UMS
builder.Services.AddScoped<IAuthService, AuthService>();

// 4. ตั้งค่า Controller และ Swagger (หน้าเว็บสำหรับเทสต์ API)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// เปิดใช้งาน CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();
