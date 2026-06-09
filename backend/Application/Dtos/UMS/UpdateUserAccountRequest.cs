namespace Application.Dtos.UMS;

public class UpdateUserAccountRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? RoleId { get; set; }
    public int? EmployeeId { get; set; }
    public bool IsActive { get; set; }
}
