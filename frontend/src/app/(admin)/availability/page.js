'use client';

import { useState, useEffect } from 'react';
import { availabilityAPI } from '@/lib/api';
import AvailabilityEditor from '@/components/AvailabilityEditor';
import { useToast } from '@/components/Toast';

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const data = await availabilityAPI.getAll();
      setSchedule(data[0]);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(updatedSchedule) {
    setSaving(true);
    try {
      await availabilityAPI.update(schedule.id, updatedSchedule);
      showToast('Availability updated');
    } catch (error) {
      console.error('Failed to update availability:', error);
      showToast('Failed to update availability', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Availability</h1>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      ) : (
        schedule && (
          <AvailabilityEditor
            schedule={schedule}
            onSave={handleSave}
            saving={saving}
          />
        )
      )}
    </div>
  );
}
