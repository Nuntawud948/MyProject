using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Infrastructure.Database;
using Infrastructure.Services.Auth;
using Infrastructure.Services.Common;
using Infrastructure.Services.Hrms;
using Microsoft.EntityFrameworkCore;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// 1. ตั้งชื่อ Policy ให้ชัดเจน (เก็บไว้ในตัวแปร จะได้ไม่พิมพ์ผิดตอนเรียกใช้)
var AllowFrontendPolicy = "AllowFrontend";

// 2. ลงทะเบียน CORS ใน Service Container แค่ครั้งเดียวพอ
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowFrontendPolicy,
        policy =>
        {
            // ใส่ URL ทั้งหมดที่อนุญาตให้ยิง API เข้ามาได้
            policy.WithOrigins(
                    "http://localhost:5173",             // 1. URL ตอนคุณรันเทสบนเครื่อง (Local)
                    "https://myprojecttrialtest.vercel.app"  // 2. URL โดเมนจริงของ Vercel (Production) รอได้ URL จริงค่อยมาแก้ตรงนี้
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
        });
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
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IFilterService, FilterService>();
builder.Services.AddScoped<ISortService, SortService>();
builder.Services.AddScoped<IPaginationService, PaginationService>();

// ── Leave Management
builder.Services.AddScoped<ILeaveService, LeaveService>();

// ลงทะเบียนระบบสิทธิ์และยืนยันตัวตน UMS
builder.Services.AddScoped<IAuthService, AuthService>();

// 4. ตั้งค่า Controller และ Swagger (หน้าเว็บสำหรับเทสต์ API)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("EnableSwagger"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// เปิดใช้งาน CORS
app.UseCors(AllowFrontendPolicy);

app.UseAuthorization();
app.MapControllers();

app.Run();
