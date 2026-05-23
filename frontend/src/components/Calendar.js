'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isPast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return compare < today;
}

function isAvailable(date, availableDays) {
  return availableDays.includes(getDayName(date)) && !isPast(date);
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function Calendar({ selectedDate, onDateSelect, availableDays = [] }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const goToPrevMonth = () => {
    if (isCurrentMonth) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const days = [];

  // Empty cells for offset
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<button key={`empty-${i}`} className="calendar-day empty" disabled />);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const available = isAvailable(date, availableDays);
    const todayClass = isToday(date) ? ' today' : '';
    const selectedClass = isSameDay(date, selectedDate) ? ' selected' : '';
    const disabledClass = !available ? ' disabled' : '';
    const availableClass = available ? ' available' : ' unavailable';

    days.push(
      <button
        key={day}
        className={`calendar-day${todayClass}${selectedClass}${disabledClass}${availableClass}`}
        onClick={() => available && onDateSelect(date)}
        disabled={!available}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          className="btn-icon"
          onClick={goToPrevMonth}
          disabled={isCurrentMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="calendar-month">{monthLabel}</span>
        <button
          className="btn-icon"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="calendar-grid">
        {DAY_HEADERS.map((header) => (
          <div key={header} className="calendar-day-header">
            {header}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}
