using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHRMSStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Department",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.RenameColumn(
                name: "ResignationDate",
                schema: "hrms",
                table: "Employees",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                schema: "hrms",
                table: "Employees",
                newName: "EmploymentType");

            migrationBuilder.AddColumn<int>(
                name: "BusinessUnitId",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "hrms",
                table: "Employees",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "hrms",
                table: "Employees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "RoleId",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Salary",
                schema: "hrms",
                table: "Employees",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                schema: "hrms",
                table: "Employees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                schema: "hrms",
                table: "Employees",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BusinessUnits",
                schema: "hrms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedById = table.Column<int>(type: "integer", nullable: true),
                    UpdatedById = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessUnits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                schema: "hrms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedById = table.Column<int>(type: "integer", nullable: true),
                    UpdatedById = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "hrms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedById = table.Column<int>(type: "integer", nullable: true),
                    UpdatedById = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_BusinessUnitId",
                schema: "hrms",
                table: "Employees",
                column: "BusinessUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                schema: "hrms",
                table: "Employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_RoleId",
                schema: "hrms",
                table: "Employees",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_BusinessUnits_BusinessUnitId",
                schema: "hrms",
                table: "Employees",
                column: "BusinessUnitId",
                principalSchema: "hrms",
                principalTable: "BusinessUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Departments_DepartmentId",
                schema: "hrms",
                table: "Employees",
                column: "DepartmentId",
                principalSchema: "hrms",
                principalTable: "Departments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Roles_RoleId",
                schema: "hrms",
                table: "Employees",
                column: "RoleId",
                principalSchema: "hrms",
                principalTable: "Roles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_BusinessUnits_BusinessUnitId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Departments_DepartmentId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Roles_RoleId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "BusinessUnits",
                schema: "hrms");

            migrationBuilder.DropTable(
                name: "Departments",
                schema: "hrms");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "hrms");

            migrationBuilder.DropIndex(
                name: "IX_Employees_BusinessUnitId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_DepartmentId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_RoleId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "BusinessUnitId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Name",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "RoleId",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Salary",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Title",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                schema: "hrms",
                table: "Employees");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                schema: "hrms",
                table: "Employees",
                newName: "ResignationDate");

            migrationBuilder.RenameColumn(
                name: "EmploymentType",
                schema: "hrms",
                table: "Employees",
                newName: "PhoneNumber");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                schema: "hrms",
                table: "Employees",
                type: "text",
                nullable: true);
        }
    }
}
