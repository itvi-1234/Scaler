'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';
import { bookingsAPI } from '@/lib/api';
import BookingCard from '@/components/BookingCard';
import { useToast } from '@/components/Toast';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { showToast } = useToast();

  const tabs = ['upcoming', 'past', 'cancelled'];

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const data = await bookingsAPI.getAll(activeTab);
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(uid) {
    try {
      await bookingsAPI.cancel(uid);
      await fetchBookings();
      showToast('Booking cancelled');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      showToast('Failed to cancel booking', 'error');
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bookings</h1>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <CalendarCheck size={48} />
          <div className="empty-state-title">No {activeTab} bookings</div>
          <div className="empty-state-description">
            {activeTab === 'upcoming'
              ? 'You have no upcoming bookings scheduled'
              : activeTab === 'past'
              ? 'You have no past bookings'
              : 'You have no cancelled bookings'}
          </div>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.uid}
              booking={booking}
              onCancel={() => handleCancel(booking.uid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
