/**
 * EventDetails.jsx — Página de Detalhes e Compra de Ingressos
 *
 * É a página principal de conversão: o usuário chega aqui
 * ao clicar em um evento na Home e é onde ocorre a compra.
 *
 * Seções:
 * - Hero: título, data, local e classificação do evento
 * - Coluna esquerda: descrição e informações de local
 * - Coluna direita: seleção de lote e finalização da compra
 * - Tela de sucesso: confirmação após compra realizada
 *
 * Rotas da API utilizadas:
 *   GET  /api/events/{id}              — dados do evento
 *   GET  /api/event-tickets/event/{id} — lotes disponíveis
 *   POST /api/tickets                  — realizar a compra
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import { Icon } from '../../assets/components/icons/icons';
import './EventDetails.css';

export default function EventDetails() {
    const { id } = useParams();

    const [event, setEvent]               = useState(null);
    const [batches, setBatches]           = useState([]);
    const [currentUser, setCurrentUser]   = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState('');

    const [loading, setLoading]           = useState(true);
    const [purchasing, setPurchasing]     = useState(false);
    const [error, setError]               = useState('');
    const [purchaseError, setPurchaseError] = useState('');
    const [purchasedTicket, setPurchasedTicket] = useState(null);

    const loadUser = () => {
        const raw = localStorage.getItem('event_ticket_user');
        setCurrentUser(raw ? JSON.parse(raw) : null);
    };

    useEffect(() => {
        loadUser();

        const handleUserChange = () => loadUser();
        window.addEventListener('userChanged', handleUserChange);

        async function fetchData() {
            try {
                const [eventData, batchesData] = await Promise.all([
                    api.events.getById(id),
                    api.eventTickets.getByEventId(id),
                ]);

                setEvent(eventData);
                setBatches(batchesData);

                // Pré-seleciona o primeiro lote disponível para compra
                const first = batchesData.find(b => {
                    const now = new Date();
                    return (
                        b.isActive &&
                        b.soldAmount < b.totalAmount &&
                        now >= new Date(b.salesStart) &&
                        now <= new Date(b.salesEnd)
                    );
                });

                if (first) setSelectedBatchId(first.id);
            } catch {
                setError('Não foi possível carregar os detalhes do evento.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        return () => window.removeEventListener('userChanged', handleUserChange);
    }, [id]);

    const handleOpenLogin = () => window.dispatchEvent(new Event('openAuthModal'));

    const handlePurchase = async (e) => {
        e.preventDefault();
        setPurchaseError('');
        setPurchasing(true);

        if (!currentUser) {
            handleOpenLogin();
            setPurchasing(false);
            return;
        }

        if (!selectedBatchId) {
            setPurchaseError('Selecione um lote de ingressos.');
            setPurchasing(false);
            return;
        }

        try {
            const created = await api.tickets.purchase({
                userId: currentUser.id,
                eventTicketId: parseInt(selectedBatchId),
            });

            setPurchasedTicket(created);

            // Atualiza a contagem de ingressos disponíveis
            const updated = await api.eventTickets.getByEventId(id);
            setBatches(updated);
        } catch (err) {
            setPurchaseError(err.message || 'Falha ao processar a compra.');
        } finally {
            setPurchasing(false);
        }
    };

    const getTypeName = (typeCode) => {
        const types = { 0: 'Normal', 1: 'Meia-Entrada', 2: 'VIP' };
        return types[typeCode] ?? 'Geral';
    };

    /* ── Estados de carregamento e erro ── */
    if (loading) {
        return (
            <>
                <Header />
                <div className="details-loading">
                    <Icon name="loader" size={36} />
                    <p>Carregando evento...</p>
                </div>
            </>
        );
    }

    if (error || !event) {
        return (
            <>
                <Header />
                <div className="details-error">
                    <Icon name="alert-circle" size={40} />
                    <h2>Evento não encontrado</h2>
                    <p>{error || 'Este evento não existe ou foi removido.'}</p>
                    <Link to="/" className="btn btn-primary">
                        <Icon name="arrow-left" size={16} />
                        Voltar para Eventos
                    </Link>
                </div>
            </>
        );
    }

    const now         = new Date();
    const eventDate   = new Date(event.date);
    const isExpired   = eventDate < now;
    const isCancelled = event.status === 'Cancelled' || event.status === 1;
    const isAvailable = !isExpired && !isCancelled;

    return (
        <>
            <Header />

            <div className="event-details-page">

                {/* ── Hero do evento ── */}
                <div className="event-hero-bar">
                    <div className="event-hero-inner">
                        <Link to="/" className="btn btn-ghost btn-sm hero-back-btn">
                            <Icon name="arrow-left" size={16} />
                            Todos os eventos
                        </Link>

                        <div className="event-hero-meta">
                            <span className="event-hero-date">
                                <Icon name="calendar" size={14} />
                                {eventDate.toLocaleDateString('pt-BR', {
                                    weekday: 'long', day: '2-digit',
                                    month: 'long', year: 'numeric',
                                })}
                                {' — '}
                                {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <h1 className="event-hero-title">{event.name}</h1>

                        <div className="event-hero-info">
                            <span>
                                <Icon name="map-pin" size={15} />
                                {event.address}
                            </span>
                            <span>
                                <Icon name="shield" size={15} />
                                {event.minAge === 0 ? 'Livre para todos' : `Classificação: ${event.minAge}+ anos`}
                            </span>
                        </div>

                        <div className="event-hero-badges">
                            {isCancelled && <span className="badge badge-danger">Cancelado</span>}
                            {isExpired && !isCancelled && <span className="badge badge-muted">Encerrado</span>}
                            {isAvailable && <span className="badge badge-active">Ingressos disponíveis</span>}
                        </div>
                    </div>
                </div>

                {/* ── Layout de duas colunas ── */}
                <div className="event-details-grid">

                    {/* ── Coluna esquerda: informações ── */}
                    <div className="event-info-col">
                        {event.description && (
                            <div className="info-section-card">
                                <h2>Sobre o Evento</h2>
                                <p className="event-description-text">{event.description}</p>
                            </div>
                        )}

                        <div className="info-section-card">
                            <h2>Informações do Local</h2>
                            <div className="location-info">
                                <div className="location-item">
                                    <Icon name="map-pin" size={18} />
                                    <div>
                                        <strong>Endereço</strong>
                                        <p>{event.address}</p>
                                    </div>
                                </div>
                                <div className="location-item">
                                    <Icon name="clock" size={18} />
                                    <div>
                                        <strong>Data e Horário</strong>
                                        <p>
                                            {eventDate.toLocaleDateString('pt-BR', {
                                                weekday: 'long', day: '2-digit',
                                                month: 'long', year: 'numeric',
                                            })}
                                            <br />
                                            Abertura dos portões às {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="location-item">
                                    <Icon name="shield" size={18} />
                                    <div>
                                        <strong>Classificação Etária</strong>
                                        <p>
                                            {event.minAge === 0
                                                ? 'Livre para todos os públicos'
                                                : `Proibido para menores de ${event.minAge} anos`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Coluna direita: compra de ingresso ── */}
                    <div className="event-purchase-col">
                        {purchasedTicket ? (
                            /* ── Tela de sucesso após compra ── */
                            <div className="purchase-success-card">
                                <div className="success-icon-wrapper">
                                    <Icon name="check-circle" size={32} />
                                </div>
                                <h2>Ingresso Confirmado!</h2>
                                <p>Seu ingresso foi gerado com sucesso e está disponível em "Meus Ingressos".</p>

                                <div className="ticket-receipt">
                                    <div className="receipt-row">
                                        <span>Evento</span>
                                        <strong>{event.name}</strong>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Tipo</span>
                                        <strong>{getTypeName(purchasedTicket.eventTicket?.type)}</strong>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Código</span>
                                        <code className="receipt-code">{purchasedTicket.id?.substring(0, 12)}...</code>
                                    </div>
                                    <div className="receipt-row receipt-row--total">
                                        <span>Valor Pago</span>
                                        <strong>R$ {purchasedTicket.priceFinal?.toFixed(2)}</strong>
                                    </div>
                                </div>

                                <div className="success-actions">
                                    <Link to="/meus-ingressos" className="btn btn-primary" style={{ width: '100%' }}>
                                        <Icon name="ticket" size={16} />
                                        Ver Meus Ingressos
                                    </Link>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ width: '100%' }}
                                        onClick={() => setPurchasedTicket(null)}
                                    >
                                        Comprar Outro Ingresso
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── Formulário de compra ── */
                            <div className="purchase-card">
                                <h2>
                                    <Icon name="ticket" size={20} />
                                    Adquirir Ingresso
                                </h2>

                                {!isAvailable ? (
                                    <div className="alert alert-warning">
                                        <Icon name="alert-circle" size={16} />
                                        {isCancelled
                                            ? 'Este evento foi cancelado e não está vendendo ingressos.'
                                            : 'Este evento já encerrou. Não é possível comprar ingressos.'
                                        }
                                    </div>
                                ) : batches.length === 0 ? (
                                    <div className="alert alert-info">
                                        <Icon name="info" size={16} />
                                        Nenhum lote de ingressos disponível para este evento no momento.
                                    </div>
                                ) : (
                                    <form onSubmit={handlePurchase} className="purchase-form">
                                        {purchaseError && (
                                            <div className="alert alert-danger">
                                                <Icon name="alert-circle" size={16} />
                                                {purchaseError}
                                            </div>
                                        )}

                                        {/* Lista de lotes disponíveis */}
                                        <div className="batch-options">
                                            {batches.map(batch => {
                                                const batchNow = new Date();
                                                const soldOut   = batch.soldAmount >= batch.totalAmount;
                                                const notStarted = batchNow < new Date(batch.salesStart);
                                                const ended      = batchNow > new Date(batch.salesEnd);
                                                const disabled   = !batch.isActive || soldOut || notStarted || ended;

                                                let statusText = '';
                                                if (soldOut) statusText = 'Esgotado';
                                                else if (notStarted) statusText = 'Em breve';
                                                else if (ended) statusText = 'Encerrado';
                                                else if (!batch.isActive) statusText = 'Indisponível';

                                                const spotsLeft = batch.totalAmount - batch.soldAmount;
                                                const isLowStock = spotsLeft <= 10 && spotsLeft > 0;

                                                return (
                                                    <label
                                                        key={batch.id}
                                                        className={`batch-option-card
                                                            ${selectedBatchId === batch.id ? 'batch-option-card--selected' : ''}
                                                            ${disabled ? 'batch-option-card--disabled' : ''}
                                                        `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="batch"
                                                            value={batch.id}
                                                            checked={selectedBatchId === batch.id}
                                                            disabled={disabled}
                                                            onChange={() => setSelectedBatchId(batch.id)}
                                                        />
                                                        <div className="batch-option-info">
                                                            <div className="batch-option-name">
                                                                {batch.name}
                                                                <span className="badge badge-primary">{getTypeName(batch.type)}</span>
                                                            </div>
                                                            {disabled ? (
                                                                <span className="batch-status-text">{statusText}</span>
                                                            ) : (
                                                                <span className="batch-spots-text">
                                                                    {isLowStock
                                                                        ? <><Icon name="alert-circle" size={12}/> Apenas {spotsLeft} restantes!</>
                                                                        : <>{spotsLeft} vagas disponíveis</>
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="batch-option-price">
                                                            {disabled
                                                                ? <span className="batch-status-badge">{statusText}</span>
                                                                : <strong>R$ {batch.price.toFixed(2)}</strong>
                                                            }
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* Área do comprador / CTA */}
                                        {currentUser ? (
                                            <div className="buyer-summary">
                                                <div className="buyer-info-row">
                                                    <Icon name="user" size={16} />
                                                    <div>
                                                        <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                                                        <span>CPF: {currentUser.cpf}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg"
                                                    disabled={purchasing || !selectedBatchId}
                                                    style={{ width: '100%' }}
                                                >
                                                    {purchasing
                                                        ? <><Icon name="loader" size={16} />Processando...</>
                                                        : <><Icon name="check" size={16} />Confirmar Compra</>
                                                    }
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="login-prompt">
                                                <p>Para finalizar a compra, você precisa estar logado.</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-lg"
                                                    onClick={handleOpenLogin}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Icon name="log-in" size={16} />
                                                    Entrar / Criar Conta
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}