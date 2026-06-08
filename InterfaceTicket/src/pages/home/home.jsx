/**
 * home.jsx — Página Inicial
 *
 * É a primeira página que o usuário vê.
 * O foco é na descoberta de eventos disponíveis para compra de ingressos.
 *
 * Funcionalidades:
 * - Busca de eventos por nome ou local
 * - Listagem em grid de todos os eventos
 * - Card de evento com data, local, classificação etária e status
 * - Link direto para a página de compra de ingressos
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import { Icon } from '../../assets/components/icons/icons';
import './home.css';

export default function Home() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await api.events.getAll();
                // Ordena: próximos eventos primeiro
                const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setEvents(sorted);
            } catch {
                setError('Não foi possível carregar os eventos. Verifique se o servidor está em execução.');
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    // Formata a data para exibição amigável: "20 dez. 2025, 20:00"
    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    // Formata o badge da data: "20 DEZ"
    const formatDateBadge = (dateString) =>
        new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        }).toUpperCase();

    const getAgeText = (age) =>
        age === 0 ? 'Livre' : `+${age} anos`;

    // Filtra por termo de busca (nome ou endereço)
    const filteredEvents = events.filter(ev => {
        const term = searchTerm.toLowerCase();
        return (
            ev.name.toLowerCase().includes(term) ||
            ev.address.toLowerCase().includes(term)
        );
    });

    // Divide os eventos em destaque (2 primeiros) e listagem geral
    const featuredEvents = filteredEvents.slice(0, 2);
    const otherEvents = filteredEvents.slice(2);

    return (
        <>
            <Header />

            <main className="home-container">

                {/* ── Hero ── */}
                <section className="home-hero">
                    <div className="hero-content">
                        <p className="hero-tagline">
                            <Icon name="ticket" size={14} />
                            Plataforma de ingressos digitais
                        </p>
                        <h1>Encontre seu próximo<br />evento favorito</h1>
                        <p className="hero-subtitle">
                            Compre ingressos de forma rápida, segura e 100% digital.
                            Sem filas, sem complicação.
                        </p>

                        {/* Barra de busca */}
                        <div className="search-wrapper">
                            <Icon name="search" size={18} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Buscar por show, festival, cidade..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="search-clear"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Limpar busca"
                                >
                                    <Icon name="x" size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Conteúdo principal ── */}
                <section className="events-section">

                    {loading && (
                        <div className="loading-spinner">
                            <Icon name="loader" size={32} />
                            <p>Carregando eventos...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="home-error-state">
                            <Icon name="alert-circle" size={40} />
                            <h3>Ops! Algo deu errado</h3>
                            <p>{error}</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                <Icon name="refresh-cw" size={16} />
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredEvents.length === 0 && (
                        <div className="home-empty-state">
                            <div className="empty-icon-wrapper">
                                <Icon name="calendar" size={32} />
                            </div>
                            <h3>Nenhum evento encontrado</h3>
                            <p>
                                {searchTerm
                                    ? `Não encontramos eventos para "${searchTerm}". Tente outro termo.`
                                    : 'Ainda não há eventos cadastrados. Que tal criar o primeiro?'
                                }
                            </p>
                            {!searchTerm && (
                                <Link to="/organizar" className="btn btn-primary">
                                    <Icon name="plus" size={16} />
                                    Criar Evento
                                </Link>
                            )}
                        </div>
                    )}

                    {!loading && !error && filteredEvents.length > 0 && (
                        <>
                            {/* ── Eventos em Destaque (2 primeiros) ── */}
                            {featuredEvents.length > 0 && !searchTerm && (
                                <div className="section-block">
                                    <div className="section-header">
                                        <h2>Em Destaque</h2>
                                        <p className="section-subtitle">Os próximos grandes eventos</p>
                                    </div>
                                    <div className="featured-grid">
                                        {featuredEvents.map(event => (
                                            <EventCard key={event.id} event={event} featured />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Todos os eventos ── */}
                            <div className="section-block">
                                <div className="section-header">
                                    <h2>
                                        {searchTerm
                                            ? `Resultados para "${searchTerm}"`
                                            : 'Todos os Eventos'
                                        }
                                    </h2>
                                    <p className="section-subtitle">
                                        {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="events-grid">
                                    {(searchTerm ? filteredEvents : otherEvents).map(event => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </>
    );
}

/**
 * EventCard — Card individual de um evento
 *
 * Recebe o objeto `event` da API e exibe as informações resumidas.
 * Quando clicado, navega para a página de detalhes e compra de ingressos.
 */
function EventCard({ event, featured = false }) {
    const now = new Date();
    const eventDate = new Date(event.date);

    const isExpired   = eventDate < now;
    const isCancelled = event.status === 'Cancelled' || event.status === 1;
    const isAvailable = !isExpired && !isCancelled;

    // Formata o badge de data curto: "20 DEZ"
    const dateBadge = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    }).toUpperCase();

    // Formata a data completa para o corpo do card
    const dateDisplay = eventDate.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const timeDisplay = eventDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <article className={`event-card ${featured ? 'event-card--featured' : ''} ${!isAvailable ? 'event-card--inactive' : ''}`}>
            {/* Cabeçalho colorido com badge de data */}
            <div className="event-card-header">
                <span className="event-date-badge">{dateBadge}</span>
                {isCancelled && <span className="badge badge-danger">Cancelado</span>}
                {isExpired && !isCancelled && <span className="badge badge-muted">Encerrado</span>}
            </div>

            {/* Corpo: título e informações */}
            <div className="event-card-body">
                <h3 className="event-card-title">{event.name}</h3>

                <ul className="event-info-list">
                    <li>
                        <Icon name="calendar" size={14} />
                        <span>{dateDisplay}, {timeDisplay}</span>
                    </li>
                    <li>
                        <Icon name="map-pin" size={14} />
                        <span>{event.address}</span>
                    </li>
                </ul>
            </div>

            {/* Rodapé: classificação e CTA */}
            <div className="event-card-footer">
                <span className="age-badge">
                    <Icon name="shield" size={12} />
                    {event.minAge === 0 ? 'Livre' : `${event.minAge}+ anos`}
                </span>

                {isAvailable ? (
                    <Link to={`/evento/${event.id}`} className="btn btn-primary btn-sm">
                        Ver Ingressos
                        <Icon name="chevron-right" size={14} />
                    </Link>
                ) : (
                    <span className="btn btn-ghost btn-sm" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                        {isCancelled ? 'Cancelado' : 'Encerrado'}
                    </span>
                )}
            </div>
        </article>
    );
}