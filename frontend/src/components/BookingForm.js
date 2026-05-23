'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

function formatDateTime(date, time) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const formattedTime = `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;

  return `${formattedDate} at ${formattedTime}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BookingForm({ selectedDate, selectedTime, eventType, onSubmit, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    onSubmit({ name: name.trim(), email: email.trim(), notes: notes.trim() });
  };

  const formattedDateTime = selectedDate && selectedTime
    ? formatDateTime(selectedDate, selectedTime)
    : '';

  return (
    <form onSubmit={handleSubmit}>
      <div className="booking-info-box">
        <div className="booking-info-item">
          <CalendarIcon size={18} />
          <span>{formattedDateTime}</span>
        </div>
        <div className="booking-info-item">
          <Clock size={18} />
          <span>{eventType?.durationMinutes} min</span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Your Name *</label>
        <input
          className={`input${errors.name ? ' input-error' : ''}`}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder="John Smith"
          required
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          className={`input${errors.email ? ' input-error' : ''}`}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="john@example.com"
          required
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Additional Notes</label>
        <textarea
          className="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
          rows={3}
        />
      </div>

      <button
        className="btn-primary btn-lg"
        type="submit"
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
