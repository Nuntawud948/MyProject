using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveTypeBusinessRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MaxAccumulatedDays",
                schema: "hrms",
                table: "LeaveTypes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresOneYearService",
                schema: "hrms",
                table: "LeaveTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // ── Seed business rules for existing leave type rows ──────────────
            // Annual Leave (ลาพักร้อน): requires 1-year service, max 14 days accumulation
            migrationBuilder.Sql(@"
                UPDATE hrms.""LeaveTypes""
                SET ""RequiresOneYearService"" = true,
                    ""MaxAccumulatedDays"" = 14
                WHERE ""Name"" = 'ลาพักร้อน';
            ");

            // All other leave types already default to false / 0 from the column definition,
            // but we ensure accuracy with an explicit update for named types.
            migrationBuilder.Sql(@"
                UPDATE hrms.""LeaveTypes""
                SET ""RequiresOneYearService"" = false,
                    ""MaxAccumulatedDays"" = 0
                WHERE ""Name"" IN ('ลาไม่รับค่าจ้าง', 'ลาป่วย', 'ลากิจ', 'ลาบวช', 'ลาคลอด');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxAccumulatedDays",
                schema: "hrms",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "RequiresOneYearService",
                schema: "hrms",
                table: "LeaveTypes");
        }
    }
}
