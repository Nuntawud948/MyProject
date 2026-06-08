export interface CompanyHolidayResponse {
  id: number;
  name: string;
  holidayDate: string;
  description?: string;
  year: number;
  isActive: boolean;
}
