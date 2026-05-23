'use client';

import { User, Mail, X } from 'lucide-react';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatTimeRange(startTime, duration) {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  return `${formatTime(start)} – ${formatTime(end)}`;
}

export default function BookingCard({ booking, onCancel }) {
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      onCancel(booking.uid);
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card-datetime">
        {formatDate(booking.startTime)} •{' '}
        {formatTimeRange(booking.startTime, booking.eventType?.durationMinutes)}
      </div>
      <div className="booking-card-event">
        <span>{booking.eventType?.title}</span>
        <span className="badge-neutral">{booking.eventType?.durationMinutes} min</span>
      </div>
      <div className="booking-card-attendee">
        <User size={16} />
        <span>{booking.bookerName}</span>
      </div>
      <div className="booking-card-attendee">
        <Mail size={16} />
        <span>{booking.bookerEmail}</span>
      </div>
      {booking.bookerNotes && (
        <div className="booking-card-notes">{booking.bookerNotes}</div>
      )}
      {booking.status === 'cancelled' && (
        <span className="badge-danger">Cancelled</span>
      )}
      {booking.status !== 'cancelled' && (
        <div className="booking-card-actions">
          <button className="btn-sm btn-danger" onClick={handleCancel}>
            <X size={14} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
