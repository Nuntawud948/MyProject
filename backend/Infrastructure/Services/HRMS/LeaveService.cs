using Application.Common.Interfaces;
using Application.Common.Interfaces.HRMS;
using Application.Common.Models;
using Application.Dtos.HRMS;
using Domain.Entities.HRMS;
using Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Hrms;

public class LeaveService(
    ApplicationDbContext context,
    IPaginationService paginationService
) : ILeaveService
{
    // ══════════════════════════════════════════════════════════════════════════
    //  SIMULATION HELPER
    // ══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Counts Mon–Fri days in [start, end] (inclusive) and converts to hours.
    /// Each working day = 8 net hours (9h shift − 1h lunch).
    /// </summary>
    private static LeaveSimulateResponse CalculateWorkingHours(DateTime start, DateTime end)
    {
        const decimal hoursPerDay = 8m; // 9h shift − 1h lunch

        int totalCalendarDays = (int)(end.Date - start.Date).TotalDays + 1;
        int workingDays = 0;

        for (DateTime day = start.Date; day <= end.Date; day = day.AddDays(1))
        {
            if (day.DayOfWeek != DayOfWeek.Saturday && day.DayOfWeek != DayOfWeek.Sunday)
                workingDays++;
        }

        decimal totalHours = workingDays * hoursPerDay;

        // Handle half-day calculation for single-day requests
        if (workingDays == 1 && totalCalendarDays == 1)
        {
            var hoursDiff = (decimal)(end - start).TotalHours;
            if (hoursDiff <= 4m && hoursDiff > 0)
            {
                totalHours = 4m;
            }
        }

        return new LeaveSimulateResponse
        {
            WorkingDays = workingDays,
            TotalHours = totalHours,
            ExcludedDays = totalCalendarDays - workingDays,
            TotalCalendarDays = totalCalendarDays
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LEAVE TYPES
    // ══════════════════════════════════════════════════════════════════════════

    public async Task<Response<PaginationResponse<LeaveTypeResponse>>> GetLeaveTypesAsync(PaginationRequest request)
    {
        try
        {
            var query = context.LeaveTypes
                .AsNoTracking()
                .Where(lt => lt.IsActive)
                .Select(lt => new LeaveTypeResponse
                {
                    Id = lt.Id,
                    Name = lt.Name,
                    Description = lt.Description,
                    MaxDaysPerYear = lt.MaxDaysPerYear,
                    IsActive = lt.IsActive
                });

            var paged = await paginationService.PaginateAsync(query, request.PageNumber, request.PageSize);

            return new Response<PaginationResponse<LeaveTypeResponse>>
            {
                IsSuccess = true,
                Data = new PaginationResponse<LeaveTypeResponse>(paged.Items, paged.PageNumber, paged.PageSize, paged.TotalRecords),
                Message = "Leave types retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<LeaveTypeResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving leave types.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<LeaveTypeResponse>> GetLeaveTypeByIdAsync(int id)
    {
        try
        {
            var lt = await context.LeaveTypes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (lt == null)
                return new Response<LeaveTypeResponse> { IsSuccess = false, Message = "Leave type not found." };

            return new Response<LeaveTypeResponse>
            {
                IsSuccess = true,
                Data = new LeaveTypeResponse
                {
                    Id = lt.Id,
                    Name = lt.Name,
                    Description = lt.Description,
                    MaxDaysPerYear = lt.MaxDaysPerYear,
                    IsActive = lt.IsActive
                }
            };
        }
        catch (Exception ex)
        {
            return new Response<LeaveTypeResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<LeaveTypeResponse>> CreateLeaveTypeAsync(LeaveTypeRequest request)
    {
        try
        {
            var entity = new LeaveType
            {
                Name = request.Name,
                Description = request.Description,
                MaxDaysPerYear = request.MaxDaysPerYear
            };

            context.LeaveTypes.Add(entity);
            await context.SaveChangesAsync();

            return new Response<LeaveTypeResponse>
            {
                IsSuccess = true,
                Data = new LeaveTypeResponse
                {
                    Id = entity.Id,
                    Name = entity.Name,
                    Description = entity.Description,
                    MaxDaysPerYear = entity.MaxDaysPerYear,
                    IsActive = entity.IsActive
                },
                Message = "Leave type created successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<LeaveTypeResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<LeaveTypeResponse>> UpdateLeaveTypeAsync(int id, LeaveTypeRequest request)
    {
        try
        {
            var entity = await context.LeaveTypes.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return new Response<LeaveTypeResponse> { IsSuccess = false, Message = "Leave type not found." };

            entity.Name = request.Name;
            entity.Description = request.Description;
            entity.MaxDaysPerYear = request.MaxDaysPerYear;
            entity.UpdatedAt = DateTime.Now;

            await context.SaveChangesAsync();

            return new Response<LeaveTypeResponse>
            {
                IsSuccess = true,
                Data = new LeaveTypeResponse
                {
                    Id = entity.Id,
                    Name = entity.Name,
                    Description = entity.Description,
                    MaxDaysPerYear = entity.MaxDaysPerYear,
                    IsActive = entity.IsActive
                },
                Message = "Leave type updated successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<LeaveTypeResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<bool>> DeleteLeaveTypeAsync(int id)
    {
        try
        {
            var entity = await context.LeaveTypes.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return new Response<bool> { IsSuccess = false, Message = "Leave type not found.", Data = false };

            entity.IsActive = false; // Soft delete
            entity.UpdatedAt = DateTime.Now;
            await context.SaveChangesAsync();

            return new Response<bool> { IsSuccess = true, Data = true, Message = "Leave type deleted successfully." };
        }
        catch (Exception ex)
        {
            return new Response<bool> { IsSuccess = false, Message = ex.Message, Data = false };
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LEAVE BALANCES
    // ══════════════════════════════════════════════════════════════════════════

    public async Task<Response<List<LeaveBalanceResponse>>> GetLeaveBalancesAsync(int employeeId)
    {
        try
        {
            var balances = await context.LeaveBalances
                .AsNoTracking()
                .Include(lb => lb.Employee)
                .Include(lb => lb.LeaveType)
                .Where(lb => lb.EmployeeId == employeeId && lb.IsActive)
                .Select(lb => new LeaveBalanceResponse
                {
                    Id = lb.Id,
                    EmployeeId = lb.EmployeeId,
                    EmployeeName = lb.Employee != null
                        ? lb.Employee.FirstName + " " + lb.Employee.LastName
                        : string.Empty,
                    LeaveTypeId = lb.LeaveTypeId,
                    LeaveTypeName = lb.LeaveType != null ? lb.LeaveType.Name : string.Empty,
                    AllocatedHours = lb.AllocatedHours,
                    UsedHours = lb.UsedHours,
                    RemainingHours = lb.AllocatedHours - lb.UsedHours
                })
                .ToListAsync();

            return new Response<List<LeaveBalanceResponse>>
            {
                IsSuccess = true,
                Data = balances,
                Message = "Leave balances retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<List<LeaveBalanceResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving leave balances.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SIMULATION
    // ══════════════════════════════════════════════════════════════════════════

    public Task<Response<LeaveSimulateResponse>> SimulateLeaveAsync(LeaveSimulateRequest request)
    {
        try
        {
            if (request.EndDate.Date < request.StartDate.Date)
                return Task.FromResult(new Response<LeaveSimulateResponse>
                {
                    IsSuccess = false,
                    Message = "EndDate must be on or after StartDate."
                });

            var result = CalculateWorkingHours(request.StartDate, request.EndDate);

            return Task.FromResult(new Response<LeaveSimulateResponse>
            {
                IsSuccess = true,
                Data = result,
                Message = "Simulation calculated successfully."
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new Response<LeaveSimulateResponse>
            {
                IsSuccess = false,
                Message = ex.Message
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  LEAVE REQUESTS
    // ══════════════════════════════════════════════════════════════════════════

    public async Task<Response<PaginationResponse<LeaveRequestResponse>>> GetLeaveRequestsAsync(LeaveRequestQueryRequest request)
    {
        try
        {
            var query = context.LeaveRequests
                .AsNoTracking()
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.FirstApprover)
                .Include(lr => lr.SecondApprover)
                .AsQueryable();

            if (request.EmployeeId.HasValue)
                query = query.Where(lr => lr.EmployeeId == request.EmployeeId.Value);

            if (request.ApproverId.HasValue)
            {
                query = query.Where(lr =>
                    (lr.FirstApproverId == request.ApproverId.Value && lr.FirstApprovalStatus == "Pending") ||
                    (lr.SecondApproverId == request.ApproverId.Value && lr.FirstApprovalStatus == "Approved" && lr.SecondApprovalStatus == "Pending"));
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
                query = query.Where(lr => lr.Status == request.Status);

            if (request.LeaveTypeId.HasValue)
                query = query.Where(lr => lr.LeaveTypeId == request.LeaveTypeId.Value);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var lower = request.Search.ToLower();
                query = query.Where(lr =>
                    (lr.Employee != null && (lr.Employee.FirstName.ToLower().Contains(lower) ||
                                             lr.Employee.LastName.ToLower().Contains(lower))) ||
                    (lr.LeaveType != null && lr.LeaveType.Name.ToLower().Contains(lower)) ||
                    lr.Reason.ToLower().Contains(lower));
            }

            // Default sort: newest first
            query = query.OrderByDescending(lr => lr.CreatedAt);

            // 1. Paginate raw entities (EF-translatable)
            var paged = await paginationService.PaginateAsync(query, request.PageNumber, request.PageSize);

            // 2. Map in memory (C# static method — cannot be translated to SQL)
            var responseList = paged.Items.Select(MapToResponse).ToList();

            return new Response<PaginationResponse<LeaveRequestResponse>>
            {
                IsSuccess = true,
                Data = new PaginationResponse<LeaveRequestResponse>(responseList, paged.PageNumber, paged.PageSize, paged.TotalRecords),
                Message = "Leave requests retrieved successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<PaginationResponse<LeaveRequestResponse>>
            {
                IsSuccess = false,
                Message = "An error occurred while retrieving leave requests.",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<Response<LeaveRequestResponse>> GetLeaveRequestByIdAsync(int id)
    {
        try
        {
            var lr = await context.LeaveRequests
                .AsNoTracking()
                .Include(x => x.Employee)
                .Include(x => x.LeaveType)
                .Include(x => x.FirstApprover)
                .Include(x => x.SecondApprover)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (lr == null)
                return new Response<LeaveRequestResponse> { IsSuccess = false, Message = "Leave request not found." };

            return new Response<LeaveRequestResponse> { IsSuccess = true, Data = MapToResponse(lr) };
        }
        catch (Exception ex)
        {
            return new Response<LeaveRequestResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<LeaveRequestResponse>> CreateLeaveRequestAsync(LeaveRequestRequest request)
    {
        try
        {
            // Validate date range
            if (request.EndDate.Date < request.StartDate.Date)
                return new Response<LeaveRequestResponse>
                {
                    IsSuccess = false,
                    Message = "EndDate must be on or after StartDate."
                };

            // Auto-calculate hours using simulation
            var simulation = CalculateWorkingHours(request.StartDate, request.EndDate);

            // Load approver IDs from the employee record
            var employee = await context.Employees.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == request.EmployeeId);

            if (employee == null)
                return new Response<LeaveRequestResponse> { IsSuccess = false, Message = "Employee not found." };

            var entity = new LeaveRequest
            {
                EmployeeId = request.EmployeeId,
                LeaveTypeId = request.LeaveTypeId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                TotalHours = simulation.TotalHours,
                Reason = request.Reason,
                Status = "Pending",
                FirstApproverId = employee.FirstApproverId,
                FirstApprovalStatus = "Pending",
                SecondApproverId = employee.SecondApproverId,
                SecondApprovalStatus = "Pending",
                SubmittedByEmployeeId = request.SubmittedByEmployeeId,
                OnBehalfReason = request.OnBehalfReason
            };

            context.LeaveRequests.Add(entity);
            await context.SaveChangesAsync();

            // Reload with navigation props for response
            var created = await context.LeaveRequests
                .AsNoTracking()
                .Include(x => x.Employee)
                .Include(x => x.LeaveType)
                .Include(x => x.FirstApprover)
                .Include(x => x.SecondApprover)
                .FirstAsync(x => x.Id == entity.Id);

            return new Response<LeaveRequestResponse>
            {
                IsSuccess = true,
                Data = MapToResponse(created),
                Message = "Leave request created successfully."
            };
        }
        catch (Exception ex)
        {
            return new Response<LeaveRequestResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  APPROVALS
    // ══════════════════════════════════════════════════════════════════════════

    public async Task<Response<LeaveRequestResponse>> ApproveFirstLevelAsync(int id, LeaveApprovalRequest request)
    {
        try
        {
            var entity = await context.LeaveRequests
                .Include(x => x.Employee)
                .Include(x => x.LeaveType)
                .Include(x => x.FirstApprover)
                .Include(x => x.SecondApprover)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return new Response<LeaveRequestResponse> { IsSuccess = false, Message = "Leave request not found." };

            entity.FirstApprovalStatus = request.Status;
            entity.FirstApprovalReason = request.Remarks;
            entity.UpdatedAt = DateTime.Now;

            // If first level rejected → overall rejected immediately
            if (request.Status == "Rejected")
                entity.Status = "Rejected";

            await context.SaveChangesAsync();

            return new Response<LeaveRequestResponse>
            {
                IsSuccess = true,
                Data = MapToResponse(entity),
                Message = $"First-level approval updated to '{request.Status}'."
            };
        }
        catch (Exception ex)
        {
            return new Response<LeaveRequestResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    public async Task<Response<LeaveRequestResponse>> ApproveSecondLevelAsync(int id, LeaveApprovalRequest request)
    {
        try
        {
            var entity = await context.LeaveRequests
                .Include(x => x.Employee)
                .Include(x => x.LeaveType)
                .Include(x => x.FirstApprover)
                .Include(x => x.SecondApprover)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return new Response<LeaveRequestResponse> { IsSuccess = false, Message = "Leave request not found." };

            entity.SecondApprovalStatus = request.Status;
            entity.SecondApprovalReason = request.Remarks;
            entity.UpdatedAt = DateTime.Now;

            if (request.Status == "Approved" && entity.FirstApprovalStatus == "Approved")
            {
                // Both levels approved → finalize and deduct balance
                entity.Status = "Approved";
                await DeductLeaveBalanceAsync(entity.EmployeeId, entity.LeaveTypeId, entity.TotalHours);
            }
            else if (request.Status == "Rejected")
            {
                entity.Status = "Rejected";
            }

            await context.SaveChangesAsync();

            return new Response<LeaveRequestResponse>
            {
                IsSuccess = true,
                Data = MapToResponse(entity),
                Message = $"Second-level approval updated to '{request.Status}'."
            };
        }
        catch (Exception ex)
        {
            return new Response<LeaveRequestResponse> { IsSuccess = false, Message = ex.Message };
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  ADMIN / AUTOMATION
    // ══════════════════════════════════════════════════════════════════════════

    /// <inheritdoc/>
    public async Task AllocateInitialLeaveBalancesAsync(int employeeId)
    {
        var employee = await context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.IsActive);

        if (employee == null)
            return;

        var leaveTypes = await context.LeaveTypes
            .AsNoTracking()
            .Where(lt => lt.IsActive)
            .ToListAsync();

        var today = DateTime.Today;

        var balances = leaveTypes.Select(lt =>
        {
            bool hasOneYear = employee.StartDate.HasValue
                && (today - employee.StartDate.Value.Date).TotalDays >= 365;

            decimal allocatedHours = (lt.RequiresOneYearService && !hasOneYear)
                ? 0m
                : lt.MaxDaysPerYear * 8m;

            return new LeaveBalance
            {
                EmployeeId = employeeId,
                LeaveTypeId = lt.Id,
                AllocatedHours = allocatedHours,
                UsedHours = 0m
            };
        }).ToList();

        context.LeaveBalances.AddRange(balances);
        await context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task AllocateRetroactiveBalancesAsync()
    {
        // Find active employees that have NO leave balance records at all
        var employeeIdsWithBalances = await context.LeaveBalances
            .AsNoTracking()
            .Select(lb => lb.EmployeeId)
            .Distinct()
            .ToListAsync();

        var employeesWithoutBalances = await context.Employees
            .AsNoTracking()
            .Where(e => e.IsActive && !employeeIdsWithBalances.Contains(e.Id))
            .ToListAsync();

        foreach (var employee in employeesWithoutBalances)
        {
            await AllocateInitialLeaveBalancesAsync(employee.Id);
        }
    }

    /// <inheritdoc/>
    public async Task ProcessYearlyLeaveRolloverAsync()
    {
        var today = DateTime.Today;

        var balances = await context.LeaveBalances
            .Include(lb => lb.LeaveType)
            .Include(lb => lb.Employee)
            .Where(lb => lb.IsActive && lb.Employee != null && lb.Employee.IsActive)
            .ToListAsync();

        foreach (var balance in balances)
        {
            var leaveType = balance.LeaveType;
            if (leaveType == null) continue;

            if (leaveType.RequiresOneYearService)
            {
                // ── Annual Leave (ลาพักร้อน) carry-forward logic ────────────
                bool hasOneYear = balance.Employee!.StartDate.HasValue
                    && (today - balance.Employee.StartDate.Value.Date).TotalDays >= 365;

                if (!hasOneYear)
                {
                    // Not yet eligible — do nothing this year
                    continue;
                }

                decimal yearlyQuotaHours = leaveType.MaxDaysPerYear * 8m;
                decimal maxHours = leaveType.MaxAccumulatedDays > 0
                    ? leaveType.MaxAccumulatedDays * 8m
                    : decimal.MaxValue;

                // AvailableHours = AllocatedHours - UsedHours; carry forward
                decimal currentRemaining = balance.AllocatedHours - balance.UsedHours;
                decimal newTotal = currentRemaining + yearlyQuotaHours;

                // Cap at maximum accumulated limit
                newTotal = Math.Min(newTotal, maxHours);

                // Reset used hours, set new allocation = capped total
                balance.AllocatedHours = newTotal;
                balance.UsedHours = 0m;
            }
            else
            {
                // ── All other leave types: full yearly reset ───────────────
                balance.UsedHours = 0m;
                balance.AllocatedHours = leaveType.MaxDaysPerYear * 8m;
            }

            balance.UpdatedAt = DateTime.Now;
        }

        await context.SaveChangesAsync();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private async Task DeductLeaveBalanceAsync(int employeeId, int leaveTypeId, decimal hours)
    {
        var balance = await context.LeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == employeeId && lb.LeaveTypeId == leaveTypeId && lb.IsActive);

        if (balance != null)
        {
            balance.UsedHours += hours;
            balance.UpdatedAt = DateTime.Now;
        }
    }

    private static LeaveRequestResponse MapToResponse(LeaveRequest lr) => new()
    {
        Id = lr.Id,
        EmployeeId = lr.EmployeeId,
        EmployeeName = lr.Employee != null
            ? lr.Employee.FirstName + " " + lr.Employee.LastName
            : string.Empty,
        LeaveTypeId = lr.LeaveTypeId,
        LeaveTypeName = lr.LeaveType?.Name ?? string.Empty,
        StartDate = lr.StartDate,
        EndDate = lr.EndDate,
        TotalHours = lr.TotalHours,
        Reason = lr.Reason,
        Status = lr.Status,
        FirstApproverId = lr.FirstApproverId,
        FirstApproverName = lr.FirstApprover != null
            ? lr.FirstApprover.FirstName + " " + lr.FirstApprover.LastName
            : null,
        FirstApprovalStatus = lr.FirstApprovalStatus,
        SecondApproverId = lr.SecondApproverId,
        SecondApproverName = lr.SecondApprover != null
            ? lr.SecondApprover.FirstName + " " + lr.SecondApprover.LastName
            : null,
        SecondApprovalStatus = lr.SecondApprovalStatus,
        FirstApprovalReason = lr.FirstApprovalReason,
        SecondApprovalReason = lr.SecondApprovalReason,
        SubmittedByEmployeeId = lr.SubmittedByEmployeeId,
        OnBehalfReason = lr.OnBehalfReason,
        CreatedAt = lr.CreatedAt
    };
}
