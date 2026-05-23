'use client';

import { useState, useEffect } from 'react';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function generateTimeOptions() {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h < 12 ? 'AM' : 'PM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export default function AvailabilityEditor({ schedule, onSave }) {
  const [localSchedule, setLocalSchedule] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (schedule) {
      setLocalSchedule(JSON.parse(JSON.stringify(schedule)));
    }
  }, [schedule]);

  if (!localSchedule) return null;

  const updateSlot = (index, field, value) => {
    setLocalSchedule((prev) => {
      const updated = { ...prev };
      updated.slots = [...updated.slots];
      updated.slots[index] = { ...updated.slots[index], [field]: value };
      return updated;
    });
  };

  const updateTimezone = (timezone) => {
    setLocalSchedule((prev) => ({ ...prev, timezone }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSchedule);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="availability-editor">
      <h3>{localSchedule.name}</h3>

      <div className="form-group">
        <label className="form-label">Timezone</label>
        <select
          className="select"
          value={localSchedule.timezone}
          onChange={(e) => updateTimezone(e.target.value)}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {localSchedule.slots.map((slot, index) => (
        <div className="availability-row" key={slot.day}>
          <div className="availability-day">{slot.day}</div>
          <div
            className={`toggle${slot.enabled ? ' active' : ''}`}
            onClick={() => updateSlot(index, 'enabled', !slot.enabled)}
            role="switch"
            aria-checked={slot.enabled}
            tabIndex={0}
          />
          <div
            className={`availability-times${!slot.enabled ? ' availability-disabled' : ''}`}
          >
            <select
              className="select input"
              value={slot.start}
              onChange={(e) => updateSlot(index, 'start', e.target.value)}
              disabled={!slot.enabled}
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="availability-dash">–</span>
            <select
              className="select input"
              value={slot.end}
              onChange={(e) => updateSlot(index, 'end', e.target.value)}
              disabled={!slot.enabled}
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <div className="mt-lg">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
