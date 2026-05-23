'use client';

import { Copy, Edit, Trash2, Link as LinkIcon } from 'lucide-react';

export default function EventTypeCard({ eventType, onEdit, onDelete, onToggle, onCopy }) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      onDelete(eventType.id);
    }
  };

  return (
    <div className={`event-type-card${!eventType.isActive ? ' event-type-card-inactive' : ''}`}>
      <div
        className="event-type-card-border"
        style={{ backgroundColor: eventType.color || '#111827' }}
      />
      <div className="event-type-card-content">
        <div className="event-type-card-title">{eventType.title}</div>
        <div className="event-type-card-meta">
          <span className="badge-neutral">{eventType.durationMinutes} min</span>
          <span className="event-type-card-slug">
            <LinkIcon size={14} />
            /booking/john-doe/{eventType.slug}
          </span>
        </div>
        {eventType.description && (
          <div className="event-type-card-desc">{eventType.description}</div>
        )}
        <div className="event-type-card-actions">
          <button
            className="btn-icon"
            onClick={() => onCopy(eventType)}
            title="Copy link"
          >
            <Copy size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => onEdit(eventType)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <div
            className={`toggle${eventType.isActive ? ' active' : ''}`}
            onClick={() => onToggle(eventType.id)}
            role="switch"
            aria-checked={eventType.isActive}
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
