'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COLOR_OPTIONS = [
  '#111827',
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
];

const DURATION_OPTIONS = [15, 30, 45, 60];

export default function EventTypeModal({ isOpen, onClose, onSave, eventType }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [duration, setDuration] = useState('30');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#111827');

  useEffect(() => {
    if (isOpen) {
      if (eventType) {
        setTitle(eventType.title || '');
        setSlug(eventType.slug || '');
        setDuration(String(eventType.durationMinutes || 30));
        setDescription(eventType.description || '');
        setLocation(eventType.location || '');
        setColor(eventType.color || '#111827');
      } else {
        setTitle('');
        setSlug('');
        setDuration('30');
        setDescription('');
        setLocation('');
        setColor('#111827');
      }
    }
  }, [eventType, isOpen]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!eventType) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !slug.trim()) {
      return;
    }
    onSave({
      title: title.trim(),
      slug: slug.trim(),
      durationMinutes: parseInt(duration, 10),
      description: description.trim(),
      location: location.trim(),
      color,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {eventType ? 'Edit Event Type' : 'New Event Type'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="input"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Quick Chat"
            />
          </div>
          <div className="form-group">
            <label className="form-label">URL Slug *</label>
            <input
              className="input"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="quick-chat"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Duration *</label>
            <select
              className="select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this event type"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Zoom, Google Meet, etc."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-swatches">
              {COLOR_OPTIONS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
