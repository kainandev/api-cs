const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Ocorreu um erro na requisição.';
    try {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    } catch (e) {
      // Ignora erro de parsing
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  // --- USERS ---
  users: {
    getAll: () => fetch(`${API_BASE_URL}/users`).then(handleResponse),
    getById: (id) => fetch(`${API_BASE_URL}/users/${id}`).then(handleResponse),
    create: (user) => fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).then(handleResponse),
    update: (id, user) => fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }).then(handleResponse)
  },

  // --- EVENTS ---
  events: {
    getAll: () => fetch(`${API_BASE_URL}/events`).then(handleResponse),
    getById: (id) => fetch(`${API_BASE_URL}/events/${id}`).then(handleResponse),
    create: (event) => fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).then(handleResponse),
    update: (id, event) => fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' }).then(handleResponse),
    getSummary: (id) => fetch(`${API_BASE_URL}/events/${id}/summary`).then(handleResponse),
    getAttendees: (id) => fetch(`${API_BASE_URL}/events/${id}/attendees`).then(handleResponse)
  },

  // --- EVENT TICKETS (Lotes) ---
  eventTickets: {
    getAll: () => fetch(`${API_BASE_URL}/event-tickets`).then(handleResponse),
    getById: (id) => fetch(`${API_BASE_URL}/event-tickets/${id}`).then(handleResponse),
    getByEventId: (eventId) => fetch(`${API_BASE_URL}/event-tickets/event/${eventId}`).then(handleResponse),
    create: (eventTicket) => fetch(`${API_BASE_URL}/event-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventTicket)
    }).then(handleResponse),
    update: (id, eventTicket) => fetch(`${API_BASE_URL}/event-tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventTicket)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/event-tickets/${id}`, { method: 'DELETE' }).then(handleResponse)
  },

  // --- TICKETS (Ingressos Comprados) ---
  tickets: {
    getAll: () => fetch(`${API_BASE_URL}/tickets`).then(handleResponse),
    getById: (id) => fetch(`${API_BASE_URL}/tickets/${id}`).then(handleResponse),
    getByUserId: (userId) => fetch(`${API_BASE_URL}/tickets/user/${userId}`).then(handleResponse),
    purchase: (ticket) => fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    }).then(handleResponse),
    cancel: (id) => fetch(`${API_BASE_URL}/tickets/${id}`, { method: 'DELETE' }).then(handleResponse),
    checkIn: (id) => fetch(`${API_BASE_URL}/tickets/${id}/checkin`, { method: 'POST' }).then(handleResponse)
  }
};
