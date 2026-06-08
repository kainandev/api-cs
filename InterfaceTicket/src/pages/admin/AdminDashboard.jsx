/**
 * OrganizePage.jsx — Painel do Organizador
 *
 * Esta página é voltada para quem quer CRIAR e GERENCIAR eventos.
 * É uma funcionalidade adicional — o foco principal da plataforma
 * é a compra de ingressos (página Home e Meus Ingressos).
 *
 * Abas disponíveis:
 *   1. Eventos     — lista todos os eventos, permite editar e excluir
 *   2. Novo Evento — formulário de criação
 *   3. Editar Evento — formulário pré-preenchido (abre ao clicar em "Editar")
 *   4. Lotes       — criar e editar lotes de ingressos de um evento
 *   5. Relatórios  — resumo financeiro + lista de participantes (check-in)
 *
 * Rotas da API utilizadas:
 *   GET  /api/events              — listar eventos
 *   POST /api/events              — criar evento
 *   PUT  /api/events/{id}         — editar evento  ← NOVO
 *   DELETE /api/events/{id}       — excluir evento
 *   GET  /api/event-tickets       — listar lotes
 *   POST /api/event-tickets       — criar lote
 *   PUT  /api/event-tickets/{id}  — editar lote    ← NOVO
 *   DELETE /api/event-tickets/{id}— excluir lote
 *   GET  /api/events/{id}/summary — resumo financeiro
 *   GET  /api/events/{id}/attendees — lista de participantes
 *   POST /api/tickets/{id}/checkin  — validar entrada
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import { Icon } from '../../assets/components/icons/icons';
import './AdminDashboard.css';

// ── Tipos de ingresso (correspondem ao enum TicketType do C#) ──
const TICKET_TYPES = [
    { value: 0, label: 'Normal',      description: 'Preço integral' },
    { value: 1, label: 'Meia-Entrada', description: '50% de desconto' },
    { value: 2, label: 'VIP',          description: 'Acréscimo de 50%' },
];

const TYPE_LABELS = { 0: 'Normal', 1: 'Meia-Entrada', 2: 'VIP' };

export default function OrganizePage() {
    const navigate = useNavigate();

    // ── Estado de autenticação ──
    const [currentUser, setCurrentUser] = useState(null);

    // ── Estado de navegação das abas ──
    // Abas: 'events' | 'create-event' | 'edit-event' | 'batches' | 'reports'
    const [activeTab, setActiveTab] = useState('events');

    // ── Estado de dados ──
    const [events, setEvents] = useState([]);
    const [batches, setBatches] = useState([]);

    // ── Estado de item sendo editado ──
    const [editingEvent, setEditingEvent]   = useState(null); // objeto Event | null
    const [editingBatch, setEditingBatch]   = useState(null); // objeto EventTicket | null

    // ── Estado de formulário de evento ──
    const [evName, setEvName]         = useState('');
    const [evAddress, setEvAddress]   = useState('');
    const [evDescription, setEvDescription] = useState('');
    const [evDate, setEvDate]         = useState('');
    const [evMinAge, setEvMinAge]     = useState(0);

    // ── Estado de formulário de lote ──
    const [batchEventId, setBatchEventId]         = useState('');
    const [batchName, setBatchName]               = useState('');
    const [batchDescription, setBatchDescription] = useState('');
    const [batchType, setBatchType]               = useState(0);
    const [batchPrice, setBatchPrice]             = useState('');
    const [batchTotal, setBatchTotal]             = useState('');
    const [batchStart, setBatchStart]             = useState('');
    const [batchEnd, setBatchEnd]                 = useState('');
    const [batchActive, setBatchActive]           = useState(true);

    // ── Estado de relatório ──
    const [reportEventId, setReportEventId]     = useState('');
    const [eventSummary, setEventSummary]       = useState(null);
    const [eventAttendees, setEventAttendees]   = useState([]);
    const [loadingReport, setLoadingReport]     = useState(false);

    // ── Estado de feedback ──
    const [formError, setFormError]     = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [loading, setLoading]         = useState(false);

    // ── Verificação de login ──
    useEffect(() => {
        const raw = localStorage.getItem('event_ticket_user');
        if (!raw) {
            // Redireciona para a home se não estiver logado
            navigate('/');
            return;
        }
        setCurrentUser(JSON.parse(raw));
        fetchEvents();
    }, [navigate]);

    // Carrega relatório quando a aba de relatórios é selecionada
    useEffect(() => {
        if (activeTab === 'reports' && reportEventId) {
            loadReport(parseInt(reportEventId));
        }
    }, [activeTab, reportEventId]);

    const fetchEvents = async () => {
        try {
            const data = await api.events.getAll();
            setEvents(data);
            if (data.length > 0) {
                setReportEventId(data[0].id.toString());
            }
        } catch {
            setFormError('Não foi possível carregar os eventos.');
        }
    };

    const loadReport = async (eventId) => {
        setLoadingReport(true);
        setFormError('');
        try {
            const [summary, attendees] = await Promise.all([
                api.events.getSummary(eventId),
                api.events.getAttendees(eventId),
            ]);
            setEventSummary(summary);
            setEventAttendees(attendees);
        } catch {
            setFormError('Erro ao carregar relatório.');
        } finally {
            setLoadingReport(false);
        }
    };

    // ── Utilitários de formulário ──
    const clearFeedback = () => { setFormError(''); setFormSuccess(''); };
    const goToTab = (tab) => { setActiveTab(tab); clearFeedback(); };

    // ── Formulário de evento: preenche os campos para edição ──
    const openEditEvent = (event) => {
        setEditingEvent(event);
        setEvName(event.name);
        setEvAddress(event.address);
        setEvDescription(event.description || '');
        setEvMinAge(event.minAge || 0);
        // Converte a data ISO para o formato datetime-local
        setEvDate(event.date.substring(0, 16));
        goToTab('edit-event');
    };

    // ── Formulário de lote: preenche os campos para edição ──
    const openEditBatch = (batch) => {
        setEditingBatch(batch);
        setBatchEventId(batch.eventId.toString());
        setBatchName(batch.name);
        setBatchDescription(batch.description || '');
        setBatchType(batch.type);
        setBatchPrice(batch.price.toString());
        setBatchTotal(batch.totalAmount.toString());
        setBatchStart(batch.salesStart.substring(0, 16));
        setBatchEnd(batch.salesEnd.substring(0, 16));
        setBatchActive(batch.isActive);
        goToTab('batches');
    };

    const resetEventForm = () => {
        setEditingEvent(null);
        setEvName(''); setEvAddress(''); setEvDescription('');
        setEvDate(''); setEvMinAge(0);
    };

    const resetBatchForm = () => {
        setEditingBatch(null);
        setBatchEventId(''); setBatchName(''); setBatchDescription('');
        setBatchType(0); setBatchPrice(''); setBatchTotal('');
        setBatchStart(''); setBatchEnd(''); setBatchActive(true);
    };

    // ── Criar ou Atualizar Evento ──
    const handleSaveEvent = async (e) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        if (!evName.trim() || !evAddress.trim() || !evDate) {
            setFormError('Preencha os campos obrigatórios: nome, local e data.');
            setLoading(false);
            return;
        }

        const payload = {
            name: evName.trim(),
            address: evAddress.trim(),
            description: evDescription.trim(),
            date: new Date(evDate).toISOString(),
            minAge: parseInt(evMinAge) || 0,
            status: 0, // Active
        };

        try {
            if (editingEvent) {
                // PUT /api/events/{id} — Atualizar evento existente
                await api.events.update(editingEvent.id, payload);
                setFormSuccess(`Evento "${evName}" atualizado com sucesso!`);
            } else {
                // POST /api/events — Criar novo evento
                await api.events.create(payload);
                setFormSuccess(`Evento "${evName}" criado com sucesso!`);
            }

            await fetchEvents();
            resetEventForm();
            goToTab('events');
        } catch (err) {
            setFormError(err.message || 'Erro ao salvar evento.');
        } finally {
            setLoading(false);
        }
    };

    // ── Excluir Evento ──
    const handleDeleteEvent = async (eventId, eventName) => {
        if (!window.confirm(`Deseja excluir o evento "${eventName}"? Esta ação não pode ser desfeita.\n\nNota: só é possível excluir eventos sem ingressos vendidos.`)) return;
        try {
            await api.events.delete(eventId);
            await fetchEvents();
        } catch (err) {
            alert(err.message || 'Não foi possível excluir o evento.');
        }
    };

    // ── Criar ou Atualizar Lote ──
    const handleSaveBatch = async (e) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);

        if (!batchEventId || !batchName.trim() || !batchPrice || !batchTotal || !batchStart || !batchEnd) {
            setFormError('Preencha todos os campos obrigatórios do lote.');
            setLoading(false);
            return;
        }

        const payload = {
            eventId:     parseInt(batchEventId),
            name:        batchName.trim(),
            description: batchDescription.trim(),
            type:        parseInt(batchType),
            price:       parseFloat(batchPrice),
            totalAmount: parseInt(batchTotal),
            soldAmount:  editingBatch ? editingBatch.soldAmount : 0,
            salesStart:  new Date(batchStart).toISOString(),
            salesEnd:    new Date(batchEnd).toISOString(),
            isActive:    batchActive,
        };

        try {
            if (editingBatch) {
                // PUT /api/event-tickets/{id} — Atualizar lote existente
                await api.eventTickets.update(editingBatch.id, payload);
                setFormSuccess(`Lote "${batchName}" atualizado com sucesso!`);
            } else {
                // POST /api/event-tickets — Criar novo lote
                await api.eventTickets.create(payload);
                setFormSuccess(`Lote "${batchName}" criado com sucesso!`);
            }

            resetBatchForm();
            await fetchEvents();
        } catch (err) {
            setFormError(err.message || 'Erro ao salvar lote.');
        } finally {
            setLoading(false);
        }
    };

    // ── Excluir Lote ──
    const handleDeleteBatch = async (batchId, batchName) => {
        if (!window.confirm(`Deseja excluir o lote "${batchName}"?\n\nNota: lotes com ingressos vendidos não podem ser excluídos.`)) return;
        try {
            await api.eventTickets.delete(batchId);
            await fetchEvents();
        } catch (err) {
            alert(err.message || 'Não foi possível excluir o lote.');
        }
    };

    // ── Check-in manual na portaria ──
    const handleCheckIn = async (ticketId) => {
        try {
            await api.tickets.checkIn(ticketId);
            if (reportEventId) loadReport(parseInt(reportEventId));
        } catch (err) {
            alert(err.message || 'Erro ao realizar check-in.');
        }
    };

    // ── Carrega lotes quando o usuário vai para a aba de lotes ──
    const handleGoToBatches = async () => {
        resetBatchForm();
        // Carrega os lotes de todos os eventos para exibir na lista
        try {
            const allBatches = [];
            for (const ev of events) {
                const evBatches = await api.eventTickets.getByEventId(ev.id);
                allBatches.push(...evBatches.map(b => ({ ...b, eventName: ev.name })));
            }
            setBatches(allBatches);
        } catch {
            // Ignora erros ao carregar lotes
        }
        goToTab('batches');
    };

    if (!currentUser) return null;

    return (
        <>
            <Header />

            <div className="organize-container">

                {/* ── Cabeçalho da seção ── */}
                <div className="organize-header">
                    <div className="organize-title-area">
                        <Link to="/" className="btn btn-ghost btn-sm">
                            <Icon name="arrow-left" size={16} />
                            Voltar
                        </Link>
                        <div>
                            <h1>Organizar Eventos</h1>
                            <p>Gerencie seus eventos, lotes de ingressos e relatórios de participantes.</p>
                        </div>
                    </div>
                </div>

                {/* ── Navegação por abas ── */}
                <nav className="organize-tabs">
                    <button
                        className={`tab-item ${activeTab === 'events' ? 'tab-item--active' : ''}`}
                        onClick={() => goToTab('events')}
                    >
                        <Icon name="list" size={16} />
                        Meus Eventos
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'create-event' || activeTab === 'edit-event' ? 'tab-item--active' : ''}`}
                        onClick={() => { resetEventForm(); goToTab('create-event'); }}
                    >
                        <Icon name="plus" size={16} />
                        {activeTab === 'edit-event' ? 'Editar Evento' : 'Novo Evento'}
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'batches' ? 'tab-item--active' : ''}`}
                        onClick={handleGoToBatches}
                    >
                        <Icon name="ticket" size={16} />
                        Lotes de Ingressos
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'reports' ? 'tab-item--active' : ''}`}
                        onClick={() => goToTab('reports')}
                    >
                        <Icon name="bar-chart" size={16} />
                        Relatórios
                    </button>
                </nav>

                {/* ── Conteúdo principal ── */}
                <main className="organize-main">

                    {/* ─── ABA 1: Lista de Eventos ─── */}
                    {activeTab === 'events' && (
                        <div className="organize-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Meus Eventos</h2>
                                    <p className="panel-desc">
                                        Gerencie os eventos cadastrados. Clique em "Editar" para alterar informações
                                        ou em "Excluir" para remover (somente se não houver ingressos vendidos).
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { resetEventForm(); goToTab('create-event'); }}
                                >
                                    <Icon name="plus" size={16} />
                                    Novo Evento
                                </button>
                            </div>

                            {events.length === 0 ? (
                                <EmptyState
                                    icon="calendar"
                                    title="Nenhum evento cadastrado"
                                    description="Crie seu primeiro evento para começar a vender ingressos."
                                    action={<button className="btn btn-primary" onClick={() => goToTab('create-event')}>
                                        <Icon name="plus" size={16} />Criar Evento
                                    </button>}
                                />
                            ) : (
                                <div className="events-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Evento</th>
                                                <th>Data</th>
                                                <th>Local</th>
                                                <th>Lotes</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map(ev => {
                                                const evDate  = new Date(ev.date);
                                                const expired = evDate < new Date();
                                                const cancelled = ev.status === 'Cancelled' || ev.status === 1;

                                                return (
                                                    <tr key={ev.id}>
                                                        <td>
                                                            <strong className="table-event-name">{ev.name}</strong>
                                                        </td>
                                                        <td className="table-meta">
                                                            <Icon name="calendar" size={13} />
                                                            {evDate.toLocaleDateString('pt-BR')}
                                                            &nbsp;{evDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td>
                                                            <Icon name="map-pin" size={13} />
                                                            {ev.address}
                                                        </td>
                                                        <td>
                                                            <span className="batch-count">
                                                                {ev.eventTickets?.length || 0} lote{ev.eventTickets?.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {cancelled
                                                                ? <span className="badge badge-danger">Cancelado</span>
                                                                : expired
                                                                    ? <span className="badge badge-muted">Encerrado</span>
                                                                    : <span className="badge badge-active">Ativo</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    onClick={() => openEditEvent(ev)}
                                                                    title="Editar evento"
                                                                >
                                                                    <Icon name="edit" size={14} />
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleDeleteEvent(ev.id, ev.name)}
                                                                    title="Excluir evento"
                                                                >
                                                                    <Icon name="trash" size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── ABA 2/3: Criar ou Editar Evento ─── */}
                    {(activeTab === 'create-event' || activeTab === 'edit-event') && (
                        <div className="organize-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>{editingEvent ? `Editar: ${editingEvent.name}` : 'Novo Evento'}</h2>
                                    <p className="panel-desc">
                                        {editingEvent
                                            ? 'Altere as informações do evento. Os ingressos já vendidos não serão afetados.'
                                            : 'Preencha as informações abaixo. Após criar o evento, adicione lotes de ingressos na aba "Lotes".'
                                        }
                                    </p>
                                </div>
                                {editingEvent && (
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => { resetEventForm(); goToTab('create-event'); }}
                                    >
                                        <Icon name="plus" size={16} />
                                        Criar Novo
                                    </button>
                                )}
                            </div>

                            {formError   && <div className="alert alert-danger"><Icon name="alert-circle" size={16}/>{formError}</div>}
                            {formSuccess && <div className="alert alert-success"><Icon name="check-circle" size={16}/>{formSuccess}</div>}

                            <form onSubmit={handleSaveEvent} className="organize-form">
                                <div className="form-field">
                                    <label className="form-label" htmlFor="evName">Nome do Evento *</label>
                                    <input className="form-input" type="text" id="evName"
                                        placeholder="Ex: Festival de Música de Verão"
                                        value={evName} onChange={e => setEvName(e.target.value)} required />
                                </div>

                                <div className="form-field">
                                    <label className="form-label" htmlFor="evAddress">Local / Endereço *</label>
                                    <input className="form-input" type="text" id="evAddress"
                                        placeholder="Ex: Teatro Municipal, São Paulo - SP"
                                        value={evAddress} onChange={e => setEvAddress(e.target.value)} required />
                                </div>

                                <div className="form-row-two">
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="evDate">Data e Hora *</label>
                                        <input className="form-input" type="datetime-local" id="evDate"
                                            value={evDate} onChange={e => setEvDate(e.target.value)} required />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="evMinAge">Idade Mínima</label>
                                        <input className="form-input" type="number" id="evMinAge"
                                            min="0" max="100" placeholder="0 = livre para todos"
                                            value={evMinAge} onChange={e => setEvMinAge(e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="form-label" htmlFor="evDescription">Descrição do Evento</label>
                                    <textarea className="form-input form-textarea" id="evDescription" rows="4"
                                        placeholder="Descreva o evento, artistas, informações de acesso..."
                                        value={evDescription} onChange={e => setEvDescription(e.target.value)} />
                                </div>

                                <div className="form-actions-bar">
                                    <button type="button" className="btn btn-ghost"
                                        onClick={() => { resetEventForm(); goToTab('events'); }}>
                                        <Icon name="x" size={15} />Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading
                                            ? <><Icon name="loader" size={15}/>Salvando...</>
                                            : <><Icon name="save" size={15}/>{editingEvent ? 'Salvar Alterações' : 'Criar Evento'}</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ─── ABA 4: Lotes de Ingressos ─── */}
                    {activeTab === 'batches' && (
                        <div className="organize-panel">
                            {/* Lista de lotes existentes */}
                            {batches.length > 0 && !editingBatch && (
                                <div className="batch-section">
                                    <div className="panel-header">
                                        <div>
                                            <h2>Lotes Cadastrados</h2>
                                            <p className="panel-desc">
                                                Clique em "Editar" para alterar preço, quantidade ou período de vendas.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="events-table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Lote</th>
                                                    <th>Evento</th>
                                                    <th>Tipo</th>
                                                    <th>Preço</th>
                                                    <th>Vendidos / Total</th>
                                                    <th>Status</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {batches.map(batch => (
                                                    <tr key={batch.id}>
                                                        <td><strong>{batch.name}</strong></td>
                                                        <td className="table-meta">{batch.eventName}</td>
                                                        <td><span className="badge badge-primary">{TYPE_LABELS[batch.type]}</span></td>
                                                        <td>R$ {batch.price.toFixed(2)}</td>
                                                        <td>
                                                            <div className="progress-mini">
                                                                <span>{batch.soldAmount} / {batch.totalAmount}</span>
                                                                <div className="progress-bar">
                                                                    <div className="progress-fill"
                                                                        style={{ width: `${Math.min(100, (batch.soldAmount / batch.totalAmount) * 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {batch.isActive
                                                                ? <span className="badge badge-active">Ativo</span>
                                                                : <span className="badge badge-muted">Inativo</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button className="btn btn-ghost btn-sm"
                                                                    onClick={() => openEditBatch(batch)}>
                                                                    <Icon name="edit" size={14}/>Editar
                                                                </button>
                                                                <button className="btn btn-danger btn-sm"
                                                                    onClick={() => handleDeleteBatch(batch.id, batch.name)}>
                                                                    <Icon name="trash" size={14}/>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="batch-section-divider">
                                        <span>Criar novo lote</span>
                                    </div>
                                </div>
                            )}

                            {/* Formulário de criação/edição de lote */}
                            <div className="panel-header">
                                <div>
                                    <h2>{editingBatch ? `Editar Lote: ${editingBatch.name}` : 'Criar Lote de Ingressos'}</h2>
                                    <p className="panel-desc">
                                        {editingBatch
                                            ? 'Você não pode reduzir a capacidade abaixo do número de ingressos já vendidos.'
                                            : 'Cada lote tem preço, quantidade e período de vendas independentes. Você pode criar múltiplos lotes para um mesmo evento (ex: Pré-venda, 1º Lote, VIP).'
                                        }
                                    </p>
                                </div>
                                {editingBatch && (
                                    <button className="btn btn-ghost" onClick={resetBatchForm}>
                                        <Icon name="plus" size={16}/>Criar Novo
                                    </button>
                                )}
                            </div>

                            {formError   && <div className="alert alert-danger"><Icon name="alert-circle" size={16}/>{formError}</div>}
                            {formSuccess && <div className="alert alert-success"><Icon name="check-circle" size={16}/>{formSuccess}</div>}

                            {events.length === 0 ? (
                                <EmptyState icon="calendar" title="Crie um evento primeiro"
                                    description="Você precisa ter pelo menos um evento antes de criar lotes."
                                    action={<button className="btn btn-primary" onClick={() => goToTab('create-event')}>
                                        <Icon name="plus" size={16}/>Criar Evento</button>}
                                />
                            ) : (
                                <form onSubmit={handleSaveBatch} className="organize-form">
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="batchEvent">Evento *</label>
                                        <select className="form-input form-select" id="batchEvent"
                                            value={batchEventId} onChange={e => setBatchEventId(e.target.value)}
                                            required disabled={!!editingBatch}>
                                            <option value="">— Selecione o evento —</option>
                                            {events.map(ev => (
                                                <option key={ev.id} value={ev.id}>
                                                    {ev.name} ({new Date(ev.date).toLocaleDateString('pt-BR')})
                                                </option>
                                            ))}
                                        </select>
                                        {editingBatch && <small className="form-hint">O evento não pode ser alterado após a criação do lote.</small>}
                                    </div>

                                    <div className="form-row-two">
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="batchName">Nome do Lote *</label>
                                            <input className="form-input" type="text" id="batchName"
                                                placeholder="Ex: Pré-venda, 1º Lote, VIP"
                                                value={batchName} onChange={e => setBatchName(e.target.value)} required />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="batchType">Tipo de Ingresso *</label>
                                            <select className="form-input form-select" id="batchType"
                                                value={batchType} onChange={e => setBatchType(parseInt(e.target.value))}>
                                                {TICKET_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>
                                                        {t.label} — {t.description}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row-two">
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="batchPrice">Preço Base (R$) *</label>
                                            <input className="form-input" type="number" id="batchPrice"
                                                min="0" step="0.01" placeholder="0.00"
                                                value={batchPrice} onChange={e => setBatchPrice(e.target.value)} required />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="batchTotal">Quantidade Total *</label>
                                            <input className="form-input" type="number" id="batchTotal"
                                                min="1" placeholder="200"
                                                value={batchTotal} onChange={e => setBatchTotal(e.target.value)} required />
                                            {editingBatch && editingBatch.soldAmount > 0 && (
                                                <small className="form-hint">
                                                    Mínimo: {editingBatch.soldAmount} (já vendidos)
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-row-two">
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="batchStart">Início das Vendas *</label>
                                            <input className="form-input" type="datetime-local" id="batchStart"
                                                value={batchStart} onChange={e => setBatchStart(e.target.value)} required />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="batchEnd">Término das Vendas *</label>
                                            <input className="form-input" type="datetime-local" id="batchEnd"
                                                value={batchEnd} onChange={e => setBatchEnd(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label" htmlFor="batchDesc">Descrição do Lote</label>
                                        <input className="form-input" type="text" id="batchDesc"
                                            placeholder="Ex: Inclui acesso à área VIP e copo colecionável"
                                            value={batchDescription} onChange={e => setBatchDescription(e.target.value)} />
                                    </div>

                                    {editingBatch && (
                                        <div className="form-field">
                                            <label className="form-label">
                                                <input type="checkbox"
                                                    checked={batchActive}
                                                    onChange={e => setBatchActive(e.target.checked)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                Lote ativo (vendas abertas)
                                            </label>
                                        </div>
                                    )}

                                    <div className="form-actions-bar">
                                        <button type="button" className="btn btn-ghost" onClick={resetBatchForm} disabled={loading}>
                                            <Icon name="x" size={15}/>Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading
                                                ? <><Icon name="loader" size={15}/>Salvando...</>
                                                : <><Icon name="save" size={15}/>{editingBatch ? 'Salvar Alterações' : 'Criar Lote'}</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ─── ABA 5: Relatórios e Portaria ─── */}
                    {activeTab === 'reports' && (
                        <div className="organize-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Relatórios e Portaria</h2>
                                    <p className="panel-desc">
                                        Acompanhe as vendas em tempo real e valide entradas na portaria do evento.
                                    </p>
                                </div>
                            </div>

                            {events.length === 0 ? (
                                <EmptyState icon="bar-chart" title="Nenhum evento para analisar"
                                    description="Crie um evento para visualizar relatórios."
                                    action={<button className="btn btn-primary" onClick={() => goToTab('create-event')}>
                                        <Icon name="plus" size={16}/>Criar Evento</button>}
                                />
                            ) : (
                                <div className="reports-wrapper">
                                    {/* Seletor de evento */}
                                    <div className="report-selector">
                                        <label className="form-label" htmlFor="reportEvent">
                                            <Icon name="calendar" size={14}/>
                                            Selecione o evento:
                                        </label>
                                        <select className="form-input form-select" id="reportEvent"
                                            value={reportEventId} onChange={e => setReportEventId(e.target.value)}>
                                            {events.map(ev => (
                                                <option key={ev.id} value={ev.id}>
                                                    {ev.name} ({new Date(ev.date).toLocaleDateString('pt-BR')})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {loadingReport ? (
                                        <div className="loading-spinner">
                                            <Icon name="loader" size={28}/>
                                            <p>Carregando relatório...</p>
                                        </div>
                                    ) : eventSummary ? (
                                        <>
                                            {/* Cards de resumo financeiro */}
                                            <div className="summary-cards">
                                                <SummaryCard
                                                    label="Receita Total"
                                                    value={`R$ ${eventSummary.totalRevenue.toFixed(2)}`}
                                                    icon="trending-up"
                                                    color="success"
                                                />
                                                <SummaryCard
                                                    label="Ingressos Vendidos"
                                                    value={`${eventSummary.totalSold} / ${eventSummary.totalCapacity}`}
                                                    icon="ticket"
                                                    color="primary"
                                                />
                                                <SummaryCard
                                                    label="Vagas Disponíveis"
                                                    value={eventSummary.remainingSpots}
                                                    icon="users"
                                                    color="warning"
                                                />
                                                <SummaryCard
                                                    label="Ticket Médio"
                                                    value={`R$ ${eventSummary.averageTicketPrice.toFixed(2)}`}
                                                    icon="tag"
                                                    color="secondary"
                                                />
                                            </div>

                                            {/* Tabela de lotes */}
                                            <div className="report-section">
                                                <h3>Desempenho por Lote</h3>
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Lote</th>
                                                            <th>Tipo</th>
                                                            <th>Preço</th>
                                                            <th>Vendidos</th>
                                                            <th>Disponíveis</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {eventSummary.batches.map((b, i) => (
                                                            <tr key={i}>
                                                                <td><strong>{b.batchName}</strong></td>
                                                                <td>{b.type}</td>
                                                                <td>R$ {b.price.toFixed(2)}</td>
                                                                <td>{b.sold}</td>
                                                                <td>{b.available}</td>
                                                                <td>
                                                                    {b.isActive
                                                                        ? <span className="badge badge-active">Ativo</span>
                                                                        : <span className="badge badge-muted">Encerrado</span>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Lista de participantes / Portaria */}
                                            <div className="report-section">
                                                <div className="report-section-header">
                                                    <div>
                                                        <h3>Portaria — Lista de Participantes</h3>
                                                        <p>
                                                            {eventAttendees.filter(a => a.checkedIn).length} de {eventAttendees.length} participantes já entraram.
                                                        </p>
                                                    </div>
                                                </div>

                                                {eventAttendees.length === 0 ? (
                                                    <p className="empty-text">Nenhum ingresso vendido ainda.</p>
                                                ) : (
                                                    <table className="data-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Código do Ingresso</th>
                                                                <th>Lote / Tipo</th>
                                                                <th>Valor</th>
                                                                <th>Entrada</th>
                                                                <th>Ação</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {eventAttendees.map((att, i) => (
                                                                <tr key={i} className={att.checkedIn ? 'row-checked-in' : ''}>
                                                                    <td>
                                                                        <code className="ticket-code-cell">
                                                                            {att.ticketId.substring(0, 8)}...
                                                                        </code>
                                                                    </td>
                                                                    <td>{att.batchName} <span className="badge badge-muted">{att.ticketType}</span></td>
                                                                    <td>R$ {att.pricePaid.toFixed(2)}</td>
                                                                    <td>
                                                                        {att.checkedIn
                                                                            ? <span className="badge badge-active">
                                                                                <Icon name="check" size={11}/>
                                                                                {new Date(att.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                              </span>
                                                                            : <span className="badge badge-muted">Pendente</span>
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {!att.checkedIn && (
                                                                            <button
                                                                                className="btn btn-primary btn-sm"
                                                                                onClick={() => handleCheckIn(att.ticketId)}
                                                                            >
                                                                                <Icon name="door-open" size={14}/>
                                                                                Validar
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

/* ── Componentes internos ── */

function EmptyState({ icon, title, description, action }) {
    return (
        <div className="empty-state-panel">
            <div className="empty-state-icon">
                <Icon name={icon} size={28} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            {action}
        </div>
    );
}

function SummaryCard({ label, value, icon, color }) {
    return (
        <div className={`summary-card summary-card--${color}`}>
            <div className="summary-card-icon">
                <Icon name={icon} size={20} />
            </div>
            <div>
                <span className="summary-card-label">{label}</span>
                <strong className="summary-card-value">{value}</strong>
            </div>
        </div>
    );
}