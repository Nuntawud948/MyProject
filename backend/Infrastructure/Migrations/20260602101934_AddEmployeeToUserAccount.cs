using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeToUserAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees",
                column: "UserAccountId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees",
                column: "UserAccountId");
        }
    }
}
