/**
 * MyTickets.jsx — Página de Meus Ingressos
 *
 * Exibe todos os ingressos comprados pelo usuário logado.
 * Permite realizar check-in (simulação de entrada no evento)
 * e cancelar ingressos não utilizados de eventos futuros.
 *
 * Se o usuário não estiver logado, exibe um campo de busca
 * por CPF ou e-mail para encontrar os ingressos sem login formal.
 *
 * Rotas da API utilizadas:
 *   GET    /api/tickets/user/{userId}  — ingressos do usuário
 *   POST   /api/tickets/{id}/checkin  — realizar check-in
 *   DELETE /api/tickets/{id}          — cancelar ingresso
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import { Icon } from '../../assets/components/icons/icons';
import './MyTickets.css';

export default function MyTickets() {
    const [currentUser, setCurrentUser]       = useState(null);
    const [tickets, setTickets]               = useState([]);
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState('');

    // Estado para busca quando não está logado
    const [searchValue, setSearchValue]       = useState('');
    const [searchError, setSearchError]       = useState('');
    const [searching, setSearching]           = useState(false);

    const loadUser = () => {
        const raw = localStorage.getItem('event_ticket_user');
        if (raw) setCurrentUser(JSON.parse(raw));
        else { setCurrentUser(null); setTickets([]); }
    };

    useEffect(() => {
        loadUser();
        const handler = () => loadUser();
        window.addEventListener('userChanged', handler);
        return () => window.removeEventListener('userChanged', handler);
    }, []);

    useEffect(() => {
        if (currentUser) fetchTickets(currentUser.id);
    }, [currentUser]);

    const fetchTickets = async (userId) => {
        setLoading(true);
        setError('');
        try {
            const data = await api.tickets.getByUserId(userId);
            // Ordena do mais recente para o mais antigo
            setTickets(data.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)));
        } catch (err) {
            setError('Erro ao carregar ingressos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Busca o usuário pelo CPF ou e-mail sem exigir login formal
    const handleSearchUser = async (e) => {
        e.preventDefault();
        setSearchError('');
        const val = searchValue.trim();
        if (!val) { setSearchError('Informe seu CPF ou e-mail.'); return; }

        setSearching(true);
        try {
            const users = await api.users.getAll();
            const found = users.find(u =>
                u.email.toLowerCase() === val.toLowerCase() ||
                u.cpf.replace(/\D/g, '') === val.replace(/\D/g, '')
            );

            if (found) {
                localStorage.setItem('event_ticket_user', JSON.stringify(found));
                setCurrentUser(found);
                window.dispatchEvent(new Event('userChanged'));
            } else {
                setSearchError('Nenhum usuário encontrado com esse CPF ou e-mail.');
            }
        } catch {
            setSearchError('Erro ao buscar. Tente novamente.');
        } finally {
            setSearching(false);
        }
    };

    const handleCheckIn = async (ticketId) => {
        if (!window.confirm('Realizar check-in? Isso simula sua entrada física no evento e não pode ser desfeito.')) return;
        try {
            await api.tickets.checkIn(ticketId);
            fetchTickets(currentUser.id);
        } catch (err) {
            alert(err.message || 'Erro ao realizar check-in.');
        }
    };

    const handleCancel = async (ticketId) => {
        if (!window.confirm('Cancelar este ingresso? O valor será devolvido e o ingresso ficará inválido.')) return;
        try {
            await api.tickets.cancel(ticketId);
            fetchTickets(currentUser.id);
        } catch (err) {
            alert(err.message || 'Erro ao cancelar ingresso.');
        }
    };

    const handleSwitchUser = () => {
        localStorage.removeItem('event_ticket_user');
        setCurrentUser(null);
        window.dispatchEvent(new Event('userChanged'));
    };

    const getTypeLabel = (code) => {
        const map = { 0: 'Normal', 1: 'Meia-Entrada', 2: 'VIP' };
        return map[code] ?? 'Geral';
    };

    return (
        <>
            <Header />

            <main className="my-tickets-page">

                {/* ── Cabeçalho ── */}
                <div className="tickets-page-header">
                    <div className="tickets-header-inner">
                        <h1>Meus Ingressos</h1>
                        <p>Visualize, faça check-in ou cancele seus ingressos digitais.</p>
                    </div>
                </div>

                <div className="tickets-content">
                    {!currentUser ? (
                        /* ── Formulário de busca (sem login) ── */
                        <div className="tickets-search-panel">
                            <div className="search-panel-icon">
                                <Icon name="ticket" size={28} />
                            </div>
                            <h2>Encontrar Meus Ingressos</h2>
                            <p>Informe seu CPF ou e-mail cadastrado para acessar seus ingressos.</p>

                            {searchError && (
                                <div className="alert alert-danger">
                                    <Icon name="alert-circle" size={16} />{searchError}
                                </div>
                            )}

                            <form onSubmit={handleSearchUser} className="search-form">
                                <div className="form-field" style={{ width: '100%' }}>
                                    <label className="form-label" htmlFor="searchVal">CPF ou E-mail</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        id="searchVal"
                                        placeholder="seu@email.com ou 000.000.000-00"
                                        value={searchValue}
                                        onChange={e => setSearchValue(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg" disabled={searching} style={{ width: '100%' }}>
                                    {searching
                                        ? <><Icon name="loader" size={16}/>Buscando...</>
                                        : <><Icon name="search" size={16}/>Buscar Ingressos</>
                                    }
                                </button>
                            </form>

                            <p className="search-hint">
                                <Icon name="info" size={14}/>
                                Ou <button className="link-btn" onClick={() => window.dispatchEvent(new Event('openAuthModal'))}>
                                    faça login
                                </button> para acesso completo.
                            </p>
                        </div>
                    ) : (
                        /* ── Conteúdo: ingressos do usuário ── */
                        <div className="tickets-user-section">

                            {/* Cabeçalho do usuário */}
                            <div className="user-context-bar">
                                <div className="user-context-info">
                                    <div className="user-context-avatar">
                                        {currentUser.firstName.charAt(0)}
                                    </div>
                                    <div>
                                        <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                                        <span>{currentUser.email}</span>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={handleSwitchUser}>
                                    <Icon name="log-out" size={14}/>
                                    Trocar conta
                                </button>
                            </div>

                            {/* Conteúdo dos ingressos */}
                            {loading ? (
                                <div className="loading-spinner">
                                    <Icon name="loader" size={28}/>
                                    <p>Carregando seus ingressos...</p>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger">
                                    <Icon name="alert-circle" size={16}/>{error}
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="tickets-empty">
                                    <div className="tickets-empty-icon">
                                        <Icon name="ticket" size={32}/>
                                    </div>
                                    <h3>Nenhum ingresso encontrado</h3>
                                    <p>Você ainda não comprou ingressos. Explore os eventos disponíveis!</p>
                                    <Link to="/" className="btn btn-primary">
                                        <Icon name="home" size={16}/>
                                        Ver Eventos
                                    </Link>
                                </div>
                            ) : (
                                <div className="tickets-list">
                                    {tickets.map(ticket => {
                                        const eventDate = ticket.eventTicket?.event?.date
                                            ? new Date(ticket.eventTicket.event.date)
                                            : null;
                                        const isExpired = eventDate && eventDate < new Date();
                                        const isUsed    = ticket.isUsed;

                                        // Determina o status visual do ingresso
                                        let statusKey = 'active';
                                        let statusLabel = 'Ativo';
                                        if (isUsed)         { statusKey = 'used';    statusLabel = 'Utilizado'; }
                                        else if (isExpired) { statusKey = 'expired'; statusLabel = 'Expirado'; }

                                        return (
                                            <TicketCard
                                                key={ticket.id}
                                                ticket={ticket}
                                                eventDate={eventDate}
                                                isExpired={isExpired}
                                                isUsed={isUsed}
                                                statusKey={statusKey}
                                                statusLabel={statusLabel}
                                                typeLabel={getTypeLabel(ticket.eventTicket?.type)}
                                                onCheckIn={handleCheckIn}
                                                onCancel={handleCancel}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

/**
 * TicketCard — Card individual de um ingresso
 *
 * Apresenta um design de "stub de ingresso" com a borda tracejada
 * separando as informações do evento das ações do usuário.
 */
function TicketCard({ ticket, eventDate, isExpired, isUsed, statusKey, statusLabel, typeLabel, onCheckIn, onCancel }) {
    return (
        <article className={`ticket-card ticket-card--${statusKey}`}>
            {/* Parte esquerda: informações do evento */}
            <div className="ticket-card-left">
                <span className={`badge badge-${statusKey === 'active' ? 'active' : statusKey === 'used' ? 'primary' : 'muted'}`}>
                    {statusLabel}
                </span>

                <h3 className="ticket-event-title">
                    {ticket.eventTicket?.event?.name ?? 'Evento'}
                </h3>

                <ul className="ticket-meta-list">
                    {eventDate && (
                        <li>
                            <Icon name="calendar" size={13}/>
                            {eventDate.toLocaleDateString('pt-BR', {
                                day: '2-digit', month: 'short',
                                year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                        </li>
                    )}
                    {ticket.eventTicket?.event?.address && (
                        <li>
                            <Icon name="map-pin" size={13}/>
                            {ticket.eventTicket.event.address}
                        </li>
                    )}
                </ul>
            </div>

            {/* Separador estilo stub de ingresso */}
            <div className="ticket-card-divider">
                <div className="ticket-notch ticket-notch--top"/>
                <div className="ticket-notch ticket-notch--bottom"/>
            </div>

            {/* Parte central: tipo e preço */}
            <div className="ticket-card-middle">
                <span className="badge badge-primary">{typeLabel}</span>
                <strong className="ticket-price">R$ {ticket.priceFinal.toFixed(2)}</strong>
                <code className="ticket-id">{ticket.id.substring(0, 8)}</code>
            </div>

            {/* Parte direita: ações */}
            <div className="ticket-card-right">
                {!isUsed && !isExpired ? (
                    <>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onCheckIn(ticket.id)}
                        >
                            <Icon name="door-open" size={14}/>
                            Check-in
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onCancel(ticket.id)}
                        >
                            <Icon name="x" size={14}/>
                            Cancelar
                        </button>
                    </>
                ) : isUsed ? (
                    <div className="ticket-used-info">
                        <Icon name="check-circle" size={18}/>
                        <span>
                            Entrada às{' '}
                            {ticket.usedAt
                                ? new Date(ticket.usedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                : '—'
                            }
                        </span>
                    </div>
                ) : (
                    <div className="ticket-expired-info">
                        <Icon name="clock" size={16}/>
                        <span>Evento encerrado</span>
                    </div>
                )}
            </div>
        </article>
    );
}