'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { eventTypesAPI } from '@/lib/api';
import EventTypeCard from '@/components/EventTypeCard';
import EventTypeModal from '@/components/EventTypeModal';
import { useToast } from '@/components/Toast';

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchEventTypes();
  }, []);

  async function fetchEventTypes() {
    try {
      const data = await eventTypesAPI.getAll();
      setEventTypes(data);
    } catch (error) {
      console.error('Failed to fetch event types:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingEventType(null);
    setModalOpen(true);
  }

  function handleEdit(et) {
    setEditingEventType(et);
    setModalOpen(true);
  }

  async function handleSave(data) {
    try {
      if (editingEventType?.id) {
        await eventTypesAPI.update(editingEventType.id, data);
        showToast('Event type updated successfully');
      } else {
        await eventTypesAPI.create(data);
        showToast('Event type created successfully');
      }
      await fetchEventTypes();
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save event type:', error);
      showToast('Failed to save event type', 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await eventTypesAPI.delete(id);
      await fetchEventTypes();
      showToast('Event type deleted');
    } catch (error) {
      console.error('Failed to delete event type:', error);
      showToast('Failed to delete event type', 'error');
    }
  }

  async function handleToggle(id) {
    try {
      await eventTypesAPI.toggle(id);
      setEventTypes((prev) =>
        prev.map((et) =>
          et.id === id ? { ...et, isActive: !et.isActive } : et
        )
      );
      const et = eventTypes.find((et) => et.id === id);
      showToast(et?.isActive ? 'Event type disabled' : 'Event type enabled');
    } catch (error) {
      console.error('Failed to toggle event type:', error);
      showToast('Failed to toggle event type', 'error');
    }
  }

  function handleCopy(et) {
    const link = `${window.location.origin}/booking/john-doe/${et.slug}`;
    navigator.clipboard.writeText(link);
    showToast('Link copied to clipboard!');
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Event Types</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} />
          New
        </button>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <div className="empty-state-title">No event types yet</div>
          <div className="empty-state-description">
            Create your first event type to get started
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            Create Event Type
          </button>
        </div>
      ) : (
        <div className="event-types-list">
          {eventTypes.map((et) => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              onEdit={() => handleEdit(et)}
              onDelete={() => handleDelete(et.id)}
              onToggle={() => handleToggle(et.id)}
              onCopy={() => handleCopy(et)}
            />
          ))}
        </div>
      )}

      <EventTypeModal
        isOpen={modalOpen}
        eventType={editingEventType}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
