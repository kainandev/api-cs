const API_BASE = 'http://localhost:5000/api';

async function handleResponse(response) {
    if (response.status === 401) {
        localStorage.removeItem('event_ticket_token');
        localStorage.removeItem('event_ticket_user');
        window.dispatchEvent(new Event('userChanged'));
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    if (response.status === 204) return null;

    if (!response.ok) {
        let errorMsg = `Erro ${response.status}: ${response.statusText}`;
        try {
            const body = await response.text();
            errorMsg = body.replace(/^"|"$/g, '') || errorMsg;
        } catch {
            // Se não conseguir ler o corpo, usa a mensagem padrão
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

function getHeaders() {
    const token = localStorage.getItem('event_ticket_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export const api = {
    // ── AUTH ─────────────────────────────────────────────
    auth: {
        login: (credentials) => fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }).then(handleResponse),
        register: (user) => fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        }).then(handleResponse)
    },

    // ── USUÁRIOS (/api/users) ────────────────────────────
    users: {
        getAll: () => fetch(`${API_BASE}/users`, { headers: getHeaders() }).then(handleResponse),
        getById: (id) => fetch(`${API_BASE}/users/${id}`, { headers: getHeaders() }).then(handleResponse),
        create: (user) => fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(user)
        }).then(handleResponse),
        update: (id, updatedData) => fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updatedData)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/users/${id}`, { 
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse),
    },

    // ── EVENTOS (/api/events) ────────────────────────────
    events: {
        getAll: () => fetch(`${API_BASE}/events`).then(handleResponse),
        getById: (id) => fetch(`${API_BASE}/events/${id}`).then(handleResponse),
        create: (event) => fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(event)
        }).then(handleResponse),
        update: (id, updatedData) => fetch(`${API_BASE}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updatedData)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/events/${id}`, { 
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse),
        getSummary: (id) => fetch(`${API_BASE}/events/${id}/summary`, { headers: getHeaders() }).then(handleResponse),
        getAttendees: (id) => fetch(`${API_BASE}/events/${id}/attendees`, { headers: getHeaders() }).then(handleResponse),
    },

    // ── LOTES DE INGRESSOS (/api/event-tickets) ──────────
    eventTickets: {
        getAll: () => fetch(`${API_BASE}/event-tickets`).then(handleResponse),
        getById: (id) => fetch(`${API_BASE}/event-tickets/${id}`).then(handleResponse),
        getByEventId: (eventId) => fetch(`${API_BASE}/event-tickets/event/${eventId}`).then(handleResponse),
        create: (batch) => fetch(`${API_BASE}/event-tickets`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(batch)
        }).then(handleResponse),
        update: (id, updatedData) => fetch(`${API_BASE}/event-tickets/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updatedData)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE}/event-tickets/${id}`, { 
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse),
    },

    // ── INGRESSOS COMPRADOS (/api/tickets) ───────────────
    tickets: {
        getAll: () => fetch(`${API_BASE}/tickets`, { headers: getHeaders() }).then(handleResponse),
        getById: (id) => fetch(`${API_BASE}/tickets/${id}`, { headers: getHeaders() }).then(handleResponse),
        getByUserId: (userId) => fetch(`${API_BASE}/tickets/user/${userId}`, { headers: getHeaders() }).then(handleResponse),
        purchase: (data) => fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        cancel: (id) => fetch(`${API_BASE}/tickets/${id}`, { 
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse),
        checkIn: (id) => fetch(`${API_BASE}/tickets/${id}/checkin`, { 
            method: 'POST',
            headers: getHeaders()
        }).then(handleResponse),
    },
};
