using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeIdToUserAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                schema: "ums",
                table: "UserAccounts",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_EmployeeId",
                schema: "ums",
                table: "UserAccounts",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees",
                column: "UserAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_Employees_EmployeeId",
                schema: "ums",
                table: "UserAccounts",
                column: "EmployeeId",
                principalSchema: "hrms",
                principalTable: "Employees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_Employees_EmployeeId",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_EmployeeId",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees",
                column: "UserAccountId",
                unique: true);
        }
    }
}
