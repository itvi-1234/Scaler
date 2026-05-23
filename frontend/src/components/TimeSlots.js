'use client';

import { Globe } from 'lucide-react';

function formatTimeTo12Hour(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export default function TimeSlots({ slots = [], selectedSlot, onSlotSelect, loading, timezone }) {
  if (loading) {
    return (
      <div className="time-slots">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton-text"
            style={{ height: '40px' }}
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-secondary">
        No available times for this date
      </p>
    );
  }

  return (
    <div className="time-slots-container">
      <div className="time-slots">
        {slots.map((slot) => (
          <button
            key={slot}
            className={`time-slot${selectedSlot === slot ? ' selected' : ''}`}
            onClick={() => onSlotSelect(slot)}
          >
            {formatTimeTo12Hour(slot)}
          </button>
        ))}
      </div>
      {timezone && (
        <div className="text-center text-secondary mt-sm">
          <Globe size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          {timezone}
        </div>
      )}
    </div>
  );
}
