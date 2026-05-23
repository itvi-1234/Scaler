'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Calendar, Clock, User, Mail } from 'lucide-react';

export default function ConfirmationPage() {
  const { username } = useParams();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const eventTitle = searchParams.get('eventTitle') || '';
  const duration = parseInt(searchParams.get('duration') || '30', 10);

  // Format date nicely
  const formattedDate = (() => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    } catch {
      return date;
    }
  })();

  // Format time to 12-hour
  function formatTime(timeStr) {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    } catch {
      return timeStr;
    }
  }

  // Calculate end time
  function getEndTime(timeStr, durationMinutes) {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      const period = endHours >= 12 ? 'PM' : 'AM';
      const displayHours = endHours % 12 || 12;
      return `${displayHours}:${String(endMinutes).padStart(2, '0')} ${period}`;
    } catch {
      return '';
    }
  }

  const formattedTime = formatTime(time);
  const endTime = getEndTime(time, duration);
  const timeRange = endTime ? `${formattedTime} - ${endTime}` : formattedTime;

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-icon">
          <Check size={40} />
        </div>

        <h1 className="confirmation-title">This meeting is scheduled</h1>
        <p className="confirmation-subtitle">
          A calendar invitation has been sent to your email
        </p>

        <div className="confirmation-detail">
          <div className="confirmation-row">
            <div className="confirmation-icon-label">
              <Calendar size={18} />
              <span className="confirmation-label">What</span>
            </div>
            <span className="confirmation-value">{eventTitle}</span>
          </div>

          <div className="confirmation-row">
            <div className="confirmation-icon-label">
              <Clock size={18} />
              <span className="confirmation-label">When</span>
            </div>
            <span className="confirmation-value">
              {formattedDate}
              <br />
              {timeRange}
            </span>
          </div>

          <div className="confirmation-row">
            <div className="confirmation-icon-label">
              <User size={18} />
              <span className="confirmation-label">Who</span>
            </div>
            <span className="confirmation-value">{name}</span>
          </div>

          <div className="confirmation-row">
            <div className="confirmation-icon-label">
              <Mail size={18} />
              <span className="confirmation-label">Email</span>
            </div>
            <span className="confirmation-value">{email}</span>
          </div>
        </div>

        <div className="mt-lg">
          <Link href={`/booking/${username}`} className="btn btn-primary">
            Done
          </Link>
        </div>
      </div>
    </div>
  );
}
