import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Holiday } from '../types';

interface AcademicCalendarProps {
  holidays: Holiday[];
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ holidays }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isHoliday = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = holidays.find(holiday => holiday.date === dateStr);

    if (holiday) return holiday;

    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (checkDate.getDay() === 0) {
      return { date: dateStr, name: "Sunday", type: "weekend" as const, description: "Weekend" };
    }
    if (checkDate.getDay() === 6) {
      return { date: dateStr, name: "Saturday", type: "weekend" as const, description: "Weekend" };
    }

    return null;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <h3 className="text-lg font-bold">Academic Calendar</h3>
            </div>
            <p className="text-green-200 text-sm">Holidays and important dates</p>
          </div>
          <button 
            onClick={goToToday}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="text-lg font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, index) => (
            <div key={`empty-${index}`} className="h-8"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: getDaysInMonth(currentDate) }, (_, index) => {
            const day = index + 1;
            const holiday = isHoliday(day);
            const today = isToday(day);
            
            return (
              <div
                key={day}
                className={`h-8 flex items-center justify-center text-sm relative cursor-pointer rounded-lg transition-all duration-200 ${
                  today 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : holiday
                    ? holiday.type === 'national' 
                      ? 'bg-red-100 text-red-800 font-medium hover:bg-red-200' 
                      : holiday.type === 'festival'
                      ? 'bg-orange-100 text-orange-800 font-medium hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={holiday ? `${holiday.name} - ${holiday.description}` : `${day} ${monthNames[currentDate.getMonth()]}`}
              >
                {day}
                {holiday && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    holiday.type === 'national' ? 'bg-red-500' :
                    holiday.type === 'festival' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming Holidays */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Upcoming Holidays</h5>
          <div className="space-y-2">
            {holidays
              .filter(holiday => new Date(holiday.date) >= new Date())
              .slice(0, 3)
              .map((holiday, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      holiday.type === 'national' ? 'bg-red-500' :
                      holiday.type === 'festival' ? 'bg-orange-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="font-medium text-gray-700">{holiday.name}</span>
                  </div>
                  <span className="text-gray-500">{formatDate(holiday.date)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendar;
