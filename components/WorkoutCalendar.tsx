import React from 'react';
import type { WorkoutLogEntry } from '../types';

interface WorkoutCalendarProps {
  logs: WorkoutLogEntry[];
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ logs }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const loggedDates = React.useMemo(() => {
    const dates = new Set<string>();
    logs.forEach(log => {
      dates.add(new Date(log.date).toISOString().split('T')[0]);
    });
    return dates;
  }, [logs]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getWeekDayIndex = (dayIndex: number) => (dayIndex === 0 ? 6 : dayIndex - 1); // Sunday (0) becomes 6, Monday (1) becomes 0.

  const emptyDays = getWeekDayIndex(firstDayOfMonth);
  const calendarDays = [];

  for (let i = 0; i < emptyDays; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isLogged = loggedDates.has(dateStr);

    let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200";
    if (isToday) {
      dayClasses += " bg-[var(--color-primary-500)] text-white ring-2 ring-offset-2 ring-offset-black/20 ring-[var(--color-primary-500)]";
    } else if (isLogged) {
      dayClasses += " bg-green-600/70 text-white";
    } else {
      dayClasses += " text-gray-300 hover:bg-white/5";
    }
    
    calendarDays.push(
      <div key={day} className={dayClasses} title={isLogged ? "Edzés naplózva" : ""}>
        {day}
      </div>
    );
  }

  const handlePrevMonth = () => {
      setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
      setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Előző hónap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </button>
        <h3 className="text-lg font-bold text-gray-100 capitalize">
          {new Date(year, month).toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Következő hónap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map(day => (
          <div key={day} className="text-xs font-bold text-gray-400">{day}</div>
        ))}
        {calendarDays}
      </div>
    </div>
  );
};

export default WorkoutCalendar;