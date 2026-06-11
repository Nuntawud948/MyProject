using Application.Common.Models;

namespace Application.Dtos.UMS;

using System;

public class UserAccountRequest  :PaginationRequest
{
    public string? Id { get; set; } 
    public string? Username { get; set; } 
    public string? Email { get; set; } 
    
}
