using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleIdToUserAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.AddColumn<int>(
                name: "RoleId",
                schema: "ums",
                table: "UserAccounts",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_RoleId",
                schema: "ums",
                table: "UserAccounts",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_Roles_RoleId",
                schema: "ums",
                table: "UserAccounts",
                column: "RoleId",
                principalSchema: "hrms",
                principalTable: "Roles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_Roles_RoleId",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_RoleId",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "RoleId",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "ums",
                table: "UserAccounts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
