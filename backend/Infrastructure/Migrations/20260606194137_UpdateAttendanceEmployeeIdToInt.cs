using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttendanceEmployeeIdToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First drop any bad data or truncate if schema update needs it, or cast using the hint
            migrationBuilder.Sql("ALTER TABLE hrms.\"Attendances\" ALTER COLUMN \"EmployeeId\" TYPE integer USING 0;"); // Safe default fallback if previous rows existed

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeId",
                schema: "hrms",
                table: "Attendances",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EmployeeId",
                schema: "hrms",
                table: "Attendances",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_Employees_EmployeeId",
                schema: "hrms",
                table: "Attendances",
                column: "EmployeeId",
                principalSchema: "hrms",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_Employees_EmployeeId",
                schema: "hrms",
                table: "Attendances");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_EmployeeId",
                schema: "hrms",
                table: "Attendances");

            migrationBuilder.Sql("ALTER TABLE hrms.\"Attendances\" ALTER COLUMN \"EmployeeId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");

            migrationBuilder.AlterColumn<Guid>(
                name: "EmployeeId",
                schema: "hrms",
                table: "Attendances",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
