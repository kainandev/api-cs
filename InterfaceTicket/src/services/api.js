/**
 * api.js — Camada de comunicação com o backend
 *
 * Este arquivo centraliza TODAS as chamadas HTTP para a API C#.
 * Qualquer componente que precise de dados do servidor deve usar este módulo.
 *
 * Por que centralizar aqui?
 * - Se a URL da API mudar, só alteramos este arquivo.
 * - Facilita adicionar headers globais (ex: token de autenticação no futuro).
 * - O tratamento de erros fica em um único lugar.
 *
 * Estrutura da API (base: http://localhost:5142/api):
 *   /users          — usuários
 *   /events         — eventos
 *   /event-tickets  — lotes de ingressos
 *   /tickets        — ingressos comprados (comprovantes)
 */

// URL base da API.
// Certifique-se de que o backend esteja rodando com: dotnet run
// O Swagger fica disponível em: http://localhost:5142/swagger
const API_BASE = 'http://localhost:5000/api';

/**
 * handleResponse — Processa a resposta HTTP da API
 *
 * - Se a resposta for bem-sucedida (status 2xx), retorna o corpo em JSON.
 * - Se for um erro, lê a mensagem de erro da API e a lança como exceção.
 * - Respostas 204 (No Content) retornam null pois não têm corpo.
 *
 * @param {Response} response — Objeto Response do fetch()
 * @returns {Promise<any>}    — Dados da resposta ou null
 * @throws {Error}            — Com a mensagem de erro vinda da API
 */
async function handleResponse(response) {
    // 204 No Content: operação bem-sucedida sem corpo (ex: DELETE)
    if (response.status === 204) return null;

    if (!response.ok) {
        // A API retorna mensagens de erro como string simples ou JSON
        let errorMsg = `Erro ${response.status}: ${response.statusText}`;
        try {
            const body = await response.text();
            // Remove as aspas se a mensagem for uma string JSON simples ("mensagem")
            errorMsg = body.replace(/^"|"$/g, '') || errorMsg;
        } catch {
            // Se não conseguir ler o corpo, usa a mensagem padrão
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

/**
 * headers — Headers padrão para requisições com corpo JSON
 */
const jsonHeaders = { 'Content-Type': 'application/json' };

// ────────────────────────────────────────────────────────
// Exportação principal: objeto `api` com todos os módulos
// ────────────────────────────────────────────────────────
export const api = {

    // ── USUÁRIOS (/api/users) ────────────────────────────
    users: {
        /**
         * Retorna todos os usuários ativos (excluídos não aparecem).
         * GET /api/users
         */
        getAll: () =>
            fetch(`${API_BASE}/users`).then(handleResponse),

        /**
         * Retorna um usuário pelo ID.
         * GET /api/users/{id}
         */
        getById: (id) =>
            fetch(`${API_BASE}/users/${id}`).then(handleResponse),

        /**
         * Cria um novo usuário na plataforma.
         * POST /api/users
         * @param {Object} user — { firstName, lastName, cpf, email, dateOfBirth }
         */
        create: (user) =>
            fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(user),
            }).then(handleResponse),

        /**
         * Atualiza os dados de um usuário existente.
         * PUT /api/users/{id}
         * @param {string} id         — ID do usuário (UUID)
         * @param {Object} updatedData — Dados atualizados
         */
        update: (id, updatedData) =>
            fetch(`${API_BASE}/users/${id}`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify(updatedData),
            }).then(handleResponse),

        /**
         * Soft delete: marca o usuário como deletado (não remove do banco).
         * DELETE /api/users/{id}
         */
        delete: (id) =>
            fetch(`${API_BASE}/users/${id}`, {
                method: 'DELETE',
            }).then(handleResponse),
    },

    // ── EVENTOS (/api/events) ────────────────────────────
    events: {
        /**
         * Retorna todos os eventos com seus lotes de ingressos.
         * GET /api/events
         */
        getAll: () =>
            fetch(`${API_BASE}/events`).then(handleResponse),

        /**
         * Retorna um evento pelo ID com seus lotes.
         * GET /api/events/{id}
         */
        getById: (id) =>
            fetch(`${API_BASE}/events/${id}`).then(handleResponse),

        /**
         * Cria um novo evento.
         * POST /api/events
         * @param {Object} event — { name, address, description, date, minAge }
         * Regras: data não pode ser no passado; nome é obrigatório.
         */
        create: (event) =>
            fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(event),
            }).then(handleResponse),

        /**
         * Atualiza os dados de um evento.
         * PUT /api/events/{id}
         * @param {number} id          — ID do evento
         * @param {Object} updatedData — { name, address, description, date, minAge, status }
         * Regras: nova data não pode ser no passado.
         */
        update: (id, updatedData) =>
            fetch(`${API_BASE}/events/${id}`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify(updatedData),
            }).then(handleResponse),

        /**
         * Remove um evento permanentemente.
         * DELETE /api/events/{id}
         * Regra: só é possível se nenhum lote tiver ingressos vendidos.
         */
        delete: (id) =>
            fetch(`${API_BASE}/events/${id}`, {
                method: 'DELETE',
            }).then(handleResponse),

        /**
         * Retorna o resumo financeiro de um evento.
         * GET /api/events/{id}/summary
         * Retorna: receita total, ticket médio, capacidade, vendidos, por lote.
         */
        getSummary: (id) =>
            fetch(`${API_BASE}/events/${id}/summary`).then(handleResponse),

        /**
         * Retorna a lista de participantes (controle de portaria).
         * GET /api/events/{id}/attendees
         * Retorna: dados dos ingressos + status de check-in de cada um.
         */
        getAttendees: (id) =>
            fetch(`${API_BASE}/events/${id}/attendees`).then(handleResponse),
    },

    // ── LOTES DE INGRESSOS (/api/event-tickets) ──────────
    eventTickets: {
        /**
         * Retorna todos os lotes de todos os eventos.
         * GET /api/event-tickets
         */
        getAll: () =>
            fetch(`${API_BASE}/event-tickets`).then(handleResponse),

        /**
         * Retorna um lote específico pelo ID.
         * GET /api/event-tickets/{id}
         */
        getById: (id) =>
            fetch(`${API_BASE}/event-tickets/${id}`).then(handleResponse),

        /**
         * Retorna todos os lotes de um evento específico.
         * GET /api/event-tickets/event/{eventId}
         */
        getByEventId: (eventId) =>
            fetch(`${API_BASE}/event-tickets/event/${eventId}`).then(handleResponse),

        /**
         * Cria um novo lote de ingressos para um evento.
         * POST /api/event-tickets
         * @param {Object} batch — { eventId, name, description, type, price,
         *                           totalAmount, salesStart, salesEnd, isActive }
         * Tipos: 0=Normal, 1=Meia-Entrada, 2=VIP
         */
        create: (batch) =>
            fetch(`${API_BASE}/event-tickets`, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(batch),
            }).then(handleResponse),

        /**
         * Atualiza os dados de um lote existente.
         * PUT /api/event-tickets/{id}
         * @param {number} id          — ID do lote
         * @param {Object} updatedData — Dados atualizados
         * Regra: totalAmount não pode ser menor que soldAmount (já vendidos).
         */
        update: (id, updatedData) =>
            fetch(`${API_BASE}/event-tickets/${id}`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify(updatedData),
            }).then(handleResponse),

        /**
         * Remove um lote permanentemente.
         * DELETE /api/event-tickets/{id}
         * Regra: só é possível se soldAmount for 0 (nenhum vendido).
         */
        delete: (id) =>
            fetch(`${API_BASE}/event-tickets/${id}`, {
                method: 'DELETE',
            }).then(handleResponse),
    },

    // ── INGRESSOS COMPRADOS (/api/tickets) ───────────────
    tickets: {
        /**
         * Retorna todos os ingressos da plataforma.
         * GET /api/tickets
         */
        getAll: () =>
            fetch(`${API_BASE}/tickets`).then(handleResponse),

        /**
         * Retorna um ingresso pelo ID (UUID).
         * GET /api/tickets/{id}
         */
        getById: (id) =>
            fetch(`${API_BASE}/tickets/${id}`).then(handleResponse),

        /**
         * Retorna todos os ingressos de um usuário específico.
         * GET /api/tickets/user/{userId}
         */
        getByUserId: (userId) =>
            fetch(`${API_BASE}/tickets/user/${userId}`).then(handleResponse),

        /**
         * Realiza a compra de um ingresso.
         * POST /api/tickets
         * @param {Object} data — { userId, eventTicketId }
         *
         * O backend calcula automaticamente o preço final:
         *   Normal    → preço cheio
         *   HalfPrice → 50% do preço base
         *   VIP       → 150% do preço base
         *
         * Validações feitas pelo backend:
         *   - Usuário e lote existem
         *   - Evento não ocorreu e não está cancelado
         *   - Período de vendas está ativo
         *   - Lote não está esgotado
         *   - Usuário tem a idade mínima exigida
         */
        purchase: (data) =>
            fetch(`${API_BASE}/tickets`, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(data),
            }).then(handleResponse),

        /**
         * Cancela e remove um ingresso.
         * DELETE /api/tickets/{id}
         * Regras:
         *   - Não pode cancelar ingresso já utilizado
         *   - Não pode cancelar ingresso de evento já ocorrido
         * A vaga é devolvida automaticamente ao lote.
         */
        cancel: (id) =>
            fetch(`${API_BASE}/tickets/${id}`, {
                method: 'DELETE',
            }).then(handleResponse),

        /**
         * Realiza o check-in de um ingresso (validação na entrada do evento).
         * POST /api/tickets/{id}/checkin
         * Marca o ingresso como utilizado (isUsed: true) e registra o horário.
         * Regra: um ingresso já utilizado não pode ser validado novamente.
         */
        checkIn: (id) =>
            fetch(`${API_BASE}/tickets/${id}/checkin`, {
                method: 'POST',
            }).then(handleResponse),
    },
};