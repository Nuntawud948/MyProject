using Application.Common.Models;
using Application.Dtos.HRMS;

namespace Application.Common.Interfaces.HRMS;

public interface ICompanyHolidayService
{
    Task<Response<PaginationResponse<CompanyHolidayResponse>>> GetCompanyHolidaysAsync(CompanyHolidayRequest request);
    Task<Response<List<CompanyHolidayResponse>>> GetByYearAsync(int year);
    Task<Response<CompanyHolidayFormDto>> GetByIdAsync(int id);
    Task<Response<CompanyHolidayFormDto>> CreateAsync(CompanyHolidayFormDto request);
    Task<Response<CompanyHolidayResponse>> UpdateAsync(int id, CompanyHolidayFormDto request);
    Task<Response<bool>> DeleteAsync(int id);
}
