import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [batches, setBatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  const loadUser = () => {
    const userStr = localStorage.getItem('event_ticket_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    const handleUserChange = () => {
      loadUser();
    };
    window.addEventListener('userChanged', handleUserChange);

    async function fetchEventAndBatches() {
      try {
        const eventData = await api.events.getById(id);
        setEvent(eventData);

        const batchesData = await api.eventTickets.getByEventId(id);
        // Filter only active batches or show status
        setBatches(batchesData);
        
        // Select first available batch by default
        const firstAvailable = batchesData.find(b => b.isActive && b.soldAmount < b.totalAmount);
        if (firstAvailable) {
          setSelectedBatchId(firstAvailable.id);
        }
      } catch (err) {
        setError('Não foi possível carregar os detalhes do evento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndBatches();

    return () => {
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, [id]);

  const handleOpenLogin = () => {
    window.dispatchEvent(new Event('openAuthModal'));
  };

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
      setPurchaseError('Selecione um tipo de ingresso (lote).');
      setPurchasing(false);
      return;
    }

    try {
      const ticketPayload = {
        userId: currentUser.id,
        eventTicketId: parseInt(selectedBatchId),
        priceFinal: 0, // Calculated by backend
        purchasedAt: new Date().toISOString(),
        isUsed: false
      };

      const createdTicket = await api.tickets.purchase(ticketPayload);
      setPurchasedTicket(createdTicket);
      
      // Refresh batches count
      const updatedBatches = await api.eventTickets.getByEventId(id);
      setBatches(updatedBatches);
    } catch (err) {
      setPurchaseError(err.message || 'Falha ao realizar a compra.');
    } finally {
      setPurchasing(false);
    }
  };

  const getTicketTypeName = (typeCode) => {
    switch (typeCode) {
      case 0: return 'Normal';
      case 1: return 'Meia-Entrada';
      case 2: return 'VIP';
      default: return 'Geral';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="event-details-loading">
          <div className="spinner"></div>
          <p>Carregando detalhes do evento...</p>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <div className="event-details-error">
          <h2>Erro ao carregar evento</h2>
          <p>{error || 'Evento não encontrado.'}</p>
          <Link to="/" className="btn-back">Voltar para a Página Inicial</Link>
        </div>
      </>
    );
  }

  const isExpired = new Date(event.date) < new Date();
  const isCancelled = event.status === 'Cancelled' || event.status === 1;
  const isAvailable = !isExpired && !isCancelled;

  return (
    <>
      <Header />
      <div className="event-details-container">
        <div className="event-hero" style={{ background: `linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%)` }}>
          <div className="event-hero-content">
            <span className="event-detail-date">
              📅 {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <h1 className="event-detail-title">{event.name}</h1>
            <p className="event-detail-address">📍 {event.address}</p>
            <div className="event-detail-badges">
              <span className="age-detail-badge">Classificação: {event.minAge === 0 ? 'Livre' : `+${event.minAge} anos`}</span>
              {isCancelled && <span className="status-detail-badge cancelled">Cancelado</span>}
              {isExpired && <span className="status-detail-badge expired">Encerrado</span>}
            </div>
          </div>
        </div>

        <div className="event-details-grid">
          {/* Left Column: Description & Info */}
          <div className="event-info-col">
            <div className="info-card">
              <h2>Sobre o Evento</h2>
              <p className="event-description">{event.description || 'Nenhuma descrição fornecida para este evento.'}</p>
            </div>
            
            <div className="info-card">
              <h2>Detalhes do Local</h2>
              <p>📍 {event.address}</p>
              <p>O evento ocorrerá no dia {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.</p>
            </div>
          </div>

          {/* Right Column: Ticket Purchase */}
          <div className="event-tickets-col">
            {purchasedTicket ? (
              <div className="purchase-success-card">
                <div className="success-icon">✓</div>
                <h2>Compra Realizada!</h2>
                <p className="success-subtitle">Seu ingresso foi gerado com sucesso.</p>
                
                <div className="ticket-summary">
                  <div className="ticket-row">
                    <span>Evento:</span>
                    <strong>{event.name}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Tipo:</span>
                    <strong>{getTicketTypeName(purchasedTicket.eventTicket?.type)}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Código do Ingresso:</span>
                    <span className="ticket-code">{purchasedTicket.id}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Preço Pago:</span>
                    <strong className="ticket-price">R$ {purchasedTicket.priceFinal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="success-actions">
                  <Link to="/meus-ingressos" className="btn-view-my-tickets">Ver Meus Ingressos</Link>
                  <button onClick={() => setPurchasedTicket(null)} className="btn-buy-more">Comprar Outro</button>
                </div>
              </div>
            ) : (
              <div className="purchase-card">
                <h2>Adquira seu Ingresso</h2>
                
                {!isAvailable ? (
                  <div className="event-status-warning">
                    {isCancelled 
                      ? 'Este evento foi cancelado e não está mais vendendo ingressos.' 
                      : 'Este evento já ocorreu ou está encerrado.'
                    }
                  </div>
                ) : batches.length === 0 ? (
                  <div className="event-status-warning">
                    Nenhum lote de ingressos está disponível para este evento no momento.
                  </div>
                ) : (
                  <form onSubmit={handlePurchase} className="purchase-form">
                    {purchaseError && <div className="purchase-error-msg">{purchaseError}</div>}
                    
                    <div className="batches-list">
                      {batches.map(batch => {
                        const isSoldOut = batch.soldAmount >= batch.totalAmount;
                        const isNotStarted = new Date() < new Date(batch.salesStart);
                        const isEnded = new Date() > new Date(batch.salesEnd);
                        const isDisabled = !batch.isActive || isSoldOut || isNotStarted || isEnded;

                        let statusLabel = '';
                        if (isSoldOut) statusLabel = 'Esgotado';
                        else if (isNotStarted) statusLabel = 'Vendas não iniciadas';
                        else if (isEnded) statusLabel = 'Vendas encerradas';
                        else if (!batch.isActive) statusLabel = 'Indisponível';

                        return (
                          <label key={batch.id} className={`batch-option ${selectedBatchId === batch.id ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>
                            <input
                              type="radio"
                              name="eventTicketBatch"
                              value={batch.id}
                              checked={selectedBatchId === batch.id}
                              disabled={isDisabled}
                              onChange={(e) => setSelectedBatchId(parseInt(e.target.value))}
                            />
                            <div className="batch-details">
                              <span className="batch-name">
                                {batch.name} - <span className="batch-type">{getTicketTypeName(batch.type)}</span>
                              </span>
                              <span className="batch-spots">
                                {isSoldOut ? 'Esgotado' : `${batch.totalAmount - batch.soldAmount} restantes`}
                              </span>
                            </div>
                            <div className="batch-price">
                              {isDisabled ? (
                                <span className="disabled-label">{statusLabel}</span>
                              ) : (
                                <strong>R$ {batch.price.toFixed(2)}</strong>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {currentUser ? (
                      <div className="buyer-info">
                        <p>Comprador: <strong>{currentUser.firstName} {currentUser.lastName}</strong></p>
                        <p className="buyer-sub">Ingresso será vinculado ao CPF {currentUser.cpf}</p>
                        <button type="submit" disabled={purchasing} className="btn-confirm-purchase">
                          {purchasing ? 'Processando...' : 'Confirmar Compra'}
                        </button>
                      </div>
                    ) : (
                      <div className="purchase-auth-prompt">
                        <p>Para concluir a compra, você precisa acessar sua conta.</p>
                        <button type="button" onClick={handleOpenLogin} className="btn-auth-trigger">
                          Entrar / Cadastrar
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
