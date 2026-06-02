using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApproversToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FirstApproverId",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                schema: "hrms",
                table: "Employees",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SecondApproverId",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkEmail",
                schema: "hrms",
                table: "Employees",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_FirstApproverId",
                schema: "hrms",
                table: "Employees",
                column: "FirstApproverId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SecondApproverId",
                schema: "hrms",
                table: "Employees",
                column: "SecondApproverId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Employees_FirstApproverId",
                schema: "hrms",
                table: "Employees",
                column: "FirstApproverId",
                principalSchema: "hrms",
                principalTable: "Employees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Employees_SecondApproverId",
                schema: "hrms",
                table: "Employees",
                column: "SecondApproverId",
                principalSchema: "hrms",
                principalTable: "Employees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Employees_FirstApproverId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Employees_SecondApproverId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_FirstApproverId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_SecondApproverId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "FirstApproverId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "SecondApproverId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "WorkEmail",
                schema: "hrms",
                table: "Employees");
        }
    }
}
