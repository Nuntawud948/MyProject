import axios from 'axios';
import { CompanyHolidayResponse } from '../dtos/attendance/company-holiday.response';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const getCompanyHolidaysByYear = async (year: number): Promise<CompanyHolidayResponse[]> => {
  const { data } = await axios.get<{ data: { items: CompanyHolidayResponse[] } }>(
    `${BASE_URL}/api/CompanyHolidays`,
    {
      params: {
        year: year,
        pageSize: 100,
        pageNumber: 1
      }
    }
  );
  return data.data.items;
};
