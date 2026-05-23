'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { publicAPI } from '@/lib/api';

export default function UserProfilePage() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await publicAPI.getUser(params.username);
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [params.username]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <Calendar size={48} />
          <h2>User not found</h2>
          <p>The user you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const activeEventTypes = (user.eventTypes || []).filter((et) => et.isActive);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">{user.name}</div>
          <div className="profile-bio">
            {user.bio || 'Welcome to my scheduling page'}
          </div>
        </div>

        <div className="profile-events">
          {activeEventTypes.map((et) => (
            <Link
              key={et.id}
              href={`/booking/${params.username}/${et.slug}`}
              className="profile-event-card"
            >
              <div
                className="profile-event-border"
                style={{ backgroundColor: et.color || '#111827' }}
              />
              <div className="profile-event-info">
                <div className="profile-event-title">{et.title}</div>
                <div className="profile-event-duration">
                  <Clock size={14} />
                  {et.durationMinutes} min
                </div>
                {et.description && (
                  <div className="profile-event-desc">{et.description}</div>
                )}
              </div>
              <div className="profile-event-arrow">
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>

        <div className="profile-footer">Powered by Scaler</div>
      </div>
    </div>
  );
}
