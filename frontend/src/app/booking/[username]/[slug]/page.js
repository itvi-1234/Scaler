'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { publicAPI } from '@/lib/api';
import Calendar from '@/components/Calendar';
import TimeSlots from '@/components/TimeSlots';
import BookingForm from '@/components/BookingForm';
import {
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Globe,
  Calendar as CalendarIcon,
} from 'lucide-react';

export default function BookingPage() {
  const { username, slug } = useParams();
  const router = useRouter();

  const [eventType, setEventType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchEventType() {
      try {
        const data = await publicAPI.getEventType(username, slug);
        setEventType(data);
      } catch (error) {
        console.error('Failed to fetch event type:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEventType();
  }, [username, slug]);

  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setSlotsLoading(true);
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const response = await publicAPI.getSlots(
          username,
          slug,
          dateStr,
          timezone
        );
        setSlots(response.slots || response || []);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
        setStep(2);
      }
    }
    fetchSlots();
  }, [selectedDate, timezone, username, slug]);

  const availableDays = (() => {
    if (eventType?.availability?.slots) {
      return eventType.availability.slots
        .filter((s) => s.enabled)
        .map((s) => s.day);
    }
    // Default to weekdays (1=Monday ... 5=Friday)
    return [1, 2, 3, 4, 5];
  })();

  function handleDateSelect(date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(2);
  }

  function handleSlotSelect(slot) {
    setSelectedSlot(slot);
    setStep(3);
  }

  async function handleBookingSubmit(formData) {
    setBookingLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Build an ISO datetime string for startTime
      const startTime = `${dateStr}T${selectedSlot}:00.000Z`;

      await publicAPI.createBooking({
        eventTypeId: eventType.id,
        bookerName: formData.name,
        bookerEmail: formData.email,
        bookerNotes: formData.notes || null,
        startTime,
        timezone,
      });

      const searchParams = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        date: dateStr,
        time: selectedSlot,
        eventTitle: eventType.title,
        duration: String(eventType.durationMinutes),
      });

      router.push(
        `/booking/${username}/${slug}/confirmation?${searchParams.toString()}`
      );
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <div className="skeleton skeleton-card" style={{ maxWidth: 800 }} />
        </div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <p>Event type not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-layout">
        <div className="booking-sidebar">
          <a
            href={`/booking/${username}`}
            className="booking-back-btn"
          >
            <ArrowLeft size={16} />
            Back
          </a>

          <h2 className="booking-event-title">{eventType.title}</h2>

          <div className="booking-host">
            <div className="booking-host-avatar">
              {(eventType.user?.name || 'John Doe')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <span>{eventType.user?.name || 'John Doe'}</span>
          </div>

          <div className="booking-event-detail">
            <Clock size={16} />
            <span>{eventType.durationMinutes} min</span>
          </div>

          <div className="booking-event-detail">
            <MapPin size={16} />
            <span>{eventType.location || 'No location specified'}</span>
          </div>

          <div className="booking-event-detail">
            <Globe size={16} />
            <span>{timezone}</span>
          </div>
        </div>

        <div className="booking-main">
          {(step === 1 || step === 2) && (
            <div className="booking-datetime">
              <div className="booking-calendar-section">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  availableDays={availableDays}
                />
              </div>

              {step === 2 && (
                <div className="booking-slots-section">
                  <TimeSlots
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSlotSelect={handleSlotSelect}
                    loading={slotsLoading}
                    timezone={timezone}
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="booking-form-container">
              <button
                className="booking-back-btn"
                onClick={() => setStep(2)}
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="booking-form-section">
                <BookingForm
                  selectedDate={selectedDate}
                  selectedTime={selectedSlot}
                  eventType={eventType}
                  onSubmit={handleBookingSubmit}
                  loading={bookingLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
