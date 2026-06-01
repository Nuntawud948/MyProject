/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function Calendar({ selected, onSelect, className = '' }: CalendarProps) {
  // Use either the selected date or current date for local navigation state
  const [currentDate, setCurrentDate] = useState(selected || new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in the current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get first day of the month as a week day index (0 = Sunday, 1 = Monday...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Previous month total days (for padding days)
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDaySelect = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(new Date(year, month, day));
    }
  };

  // Generate date panels
  const days: { day: number; currentMonth: boolean; key: string }[] = [];

  // Padding days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthTotalDays - i,
      currentMonth: false,
      key: `prev-${prevMonthTotalDays - i}`
    });
  }

  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      day: i,
      currentMonth: true,
      key: `curr-${i}`
    });
  }

  // Padding days from next month to make a clean grid
  const remainingCells = 42 - days.length; // 6 rows * 7 columns = 42 cells
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      currentMonth: false,
      key: `next-${i}`
    });
  }

  return (
    <div className={`w-[260px] select-none p-1 ${className}`}>
      {/* Calendar Header with Controls */}
      <div className="flex items-center justify-between px-1 py-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 bg-transparent transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 bg-transparent transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 text-center text-xs text-slate-400 font-medium py-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="h-8 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center gap-1 text-xs">
        {days.map(({ day, currentMonth, key }) => {
          const isSelected =
            selected &&
            currentMonth &&
            selected.getDate() === day &&
            selected.getMonth() === month &&
            selected.getFullYear() === year;

          return (
            <button
              key={key}
              type="button"
              disabled={!currentMonth}
              onClick={(e) => handleDaySelect(day, e)}
              className={`h-8 w-8 flex items-center justify-center rounded-md font-normal transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
                isSelected
                  ? 'bg-slate-900 text-slate-50 font-semibold shadow-sm hover:bg-slate-900'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
