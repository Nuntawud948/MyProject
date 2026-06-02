using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveApprovalReasons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FirstApprovalReason",
                schema: "hrms",
                table: "LeaveRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondApprovalReason",
                schema: "hrms",
                table: "LeaveRequests",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstApprovalReason",
                schema: "hrms",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "SecondApprovalReason",
                schema: "hrms",
                table: "LeaveRequests");
        }
    }
}
