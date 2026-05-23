const API_BASE = 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const eventTypesAPI = {
  getAll: () => fetchAPI('/event-types'),
  create: (data) => fetchAPI('/event-types', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/event-types/${id}`, { method: 'DELETE' }),
  toggle: (id) => fetchAPI(`/event-types/${id}/toggle`, { method: 'PATCH' }),
};

export const availabilityAPI = {
  getAll: () => fetchAPI('/availability'),
  update: (id, data) => fetchAPI(`/availability/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const bookingsAPI = {
  getAll: (status) => fetchAPI(`/bookings?status=${status}`),
  cancel: (uid) => fetchAPI(`/bookings/${uid}/cancel`, { method: 'PATCH' }),
};

export const publicAPI = {
  getUser: (username) => fetchAPI(`/users/${username}`),
  getEventType: (username, slug) => fetchAPI(`/users/${username}/${slug}`),
  getSlots: (username, slug, date, timezone) =>
    fetchAPI(`/users/${username}/${slug}/slots?date=${date}&timezone=${encodeURIComponent(timezone)}`),
  createBooking: (data) => fetchAPI('/bookings', { method: 'POST', body: JSON.stringify(data) }),
};
