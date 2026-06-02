using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuditAndRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                schema: "ums",
                table: "UserAccounts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginDate",
                schema: "ums",
                table: "UserAccounts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "ums",
                table: "UserAccounts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                schema: "ums",
                table: "UserAccounts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiryTime",
                schema: "ums",
                table: "UserAccounts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "ums",
                table: "UserAccounts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                schema: "ums",
                table: "UserAccounts",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                schema: "hrms",
                table: "Employees",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                schema: "hrms",
                table: "Employees",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserAccountId",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_CreatedById",
                schema: "ums",
                table: "UserAccounts",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_UpdatedById",
                schema: "ums",
                table: "UserAccounts",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_CreatedById",
                schema: "hrms",
                table: "Roles",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_UpdatedById",
                schema: "hrms",
                table: "Roles",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_CreatedById",
                schema: "hrms",
                table: "Employees",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UpdatedById",
                schema: "hrms",
                table: "Employees",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees",
                column: "UserAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CreatedById",
                schema: "hrms",
                table: "Departments",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_UpdatedById",
                schema: "hrms",
                table: "Departments",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessUnits_CreatedById",
                schema: "hrms",
                table: "BusinessUnits",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessUnits_UpdatedById",
                schema: "hrms",
                table: "BusinessUnits",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessUnits_UserAccounts_CreatedById",
                schema: "hrms",
                table: "BusinessUnits",
                column: "CreatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessUnits_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "BusinessUnits",
                column: "UpdatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_UserAccounts_CreatedById",
                schema: "hrms",
                table: "Departments",
                column: "CreatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "Departments",
                column: "UpdatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_UserAccounts_CreatedById",
                schema: "hrms",
                table: "Employees",
                column: "CreatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "Employees",
                column: "UpdatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_UserAccounts_UserAccountId",
                schema: "hrms",
                table: "Employees",
                column: "UserAccountId",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_UserAccounts_CreatedById",
                schema: "hrms",
                table: "Roles",
                column: "CreatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "Roles",
                column: "UpdatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_UserAccounts_CreatedById",
                schema: "ums",
                table: "UserAccounts",
                column: "CreatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccounts_UserAccounts_UpdatedById",
                schema: "ums",
                table: "UserAccounts",
                column: "UpdatedById",
                principalSchema: "ums",
                principalTable: "UserAccounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BusinessUnits_UserAccounts_CreatedById",
                schema: "hrms",
                table: "BusinessUnits");

            migrationBuilder.DropForeignKey(
                name: "FK_BusinessUnits_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "BusinessUnits");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_UserAccounts_CreatedById",
                schema: "hrms",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_UserAccounts_CreatedById",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_UserAccounts_UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_UserAccounts_CreatedById",
                schema: "hrms",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_UserAccounts_UpdatedById",
                schema: "hrms",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_UserAccounts_CreatedById",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAccounts_UserAccounts_UpdatedById",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_CreatedById",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_UserAccounts_UpdatedById",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_Roles_CreatedById",
                schema: "hrms",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_UpdatedById",
                schema: "hrms",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Employees_CreatedById",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_UpdatedById",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Departments_CreatedById",
                schema: "hrms",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_UpdatedById",
                schema: "hrms",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_BusinessUnits_CreatedById",
                schema: "hrms",
                table: "BusinessUnits");

            migrationBuilder.DropIndex(
                name: "IX_BusinessUnits_UpdatedById",
                schema: "hrms",
                table: "BusinessUnits");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "LastLoginDate",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "Name",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiryTime",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                schema: "ums",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "EndDate",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "UserAccountId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                schema: "hrms",
                table: "Employees",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }
    }
}
