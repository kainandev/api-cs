import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import './MyTickets.css';

export default function MyTickets() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search state when not logged in
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [searchError, setSearchError] = useState('');

  const loadUser = () => {
    const userStr = localStorage.getItem('event_ticket_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      setCurrentUser(null);
      setTickets([]);
    }
  };

  useEffect(() => {
    loadUser();

    const handleUserChange = () => {
      loadUser();
    };
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  // Fetch tickets whenever the logged in user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserTickets(currentUser.id);
    }
  }, [currentUser]);

  const fetchUserTickets = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const ticketsData = await api.tickets.getByUserId(userId);
      // Sort: recent first
      const sorted = ticketsData.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
      setTickets(sorted);
    } catch (err) {
      setError('Erro ao carregar ingressos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setSearchError('');
    setError('');
    const idValue = searchIdentifier.trim();

    if (!idValue) {
      setSearchError('Insira seu CPF ou E-mail.');
      return;
    }

    setLoading(true);
    try {
      const users = await api.users.getAll();
      const foundUser = users.find(
        u => u.email.toLowerCase() === idValue.toLowerCase() || u.cpf.replace(/\D/g, '') === idValue.replace(/\D/g, '')
      );

      if (foundUser) {
        // Log user in automatically to save state
        localStorage.setItem('event_ticket_user', JSON.stringify(foundUser));
        setCurrentUser(foundUser);
        window.dispatchEvent(new Event('userChanged'));
      } else {
        setSearchError('Nenhum usuário encontrado com este CPF ou E-mail.');
        setLoading(false);
      }
    } catch (err) {
      setSearchError('Erro ao buscar usuário: ' + err.message);
      setLoading(false);
    }
  };

  const handleCheckIn = async (ticketId) => {
    if (!window.confirm('Deseja realizar o check-in deste ingresso? Esta ação simula a sua entrada física no evento.')) {
      return;
    }

    try {
      await api.tickets.checkIn(ticketId);
      alert('Check-in realizado com sucesso! Bom evento!');
      // Reload tickets
      if (currentUser) fetchUserTickets(currentUser.id);
    } catch (err) {
      alert(err.message || 'Erro ao realizar check-in.');
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este ingresso? O valor será reembolsado e o ingresso será invalidado.')) {
      return;
    }

    try {
      await api.tickets.cancel(ticketId);
      alert('Ingresso cancelado com sucesso.');
      // Reload tickets
      if (currentUser) fetchUserTickets(currentUser.id);
    } catch (err) {
      alert(err.message || 'Erro ao cancelar ingresso.');
    }
  };

  const getTicketTypeLabel = (typeCode) => {
    switch (typeCode) {
      case 0: return 'Normal';
      case 1: return 'Meia-Entrada';
      case 2: return 'VIP';
      default: return 'Geral';
    }
  };

  return (
    <>
      <Header />
      <div className="my-tickets-container">
        <section className="tickets-hero">
          <h1>Meus Ingressos</h1>
          <p>Consulte, realize check-in de entradas ou cancele seus ingressos digitais.</p>
        </section>

        <main className="tickets-main">
          {!currentUser ? (
            <div className="tickets-search-box">
              <h2>Acesse Seus Ingressos</h2>
              <p>Insira seus dados cadastrados para listar seus ingressos comprados.</p>
              
              {searchError && <div className="search-error-msg">{searchError}</div>}
              
              <form onSubmit={handleSearchUser} className="search-form-tickets">
                <div className="form-group-tickets">
                  <label htmlFor="searchIdentifier">CPF ou E-mail</label>
                  <input
                    type="text"
                    id="searchIdentifier"
                    placeholder="Ex: joao@email.com ou 123.456.789-00"
                    value={searchIdentifier}
                    onChange={(e) => setSearchIdentifier(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-search-tickets">
                  {loading ? 'Buscando...' : 'Buscar Ingressos'}
                </button>
              </form>
            </div>
          ) : (
            <div className="logged-tickets-section">
              <div className="user-tickets-header">
                <div>
                  <h3>Ingressos de: <strong>{currentUser.firstName} {currentUser.lastName}</strong></h3>
                  <p>E-mail: {currentUser.email} | CPF: {currentUser.cpf}</p>
                </div>
                <button onClick={() => {
                  localStorage.removeItem('event_ticket_user');
                  setCurrentUser(null);
                  window.dispatchEvent(new Event('userChanged'));
                }} className="btn-switch-user">
                  Trocar de Conta
                </button>
              </div>

              {loading ? (
                <div className="tickets-loading">
                  <div className="spinner"></div>
                  <p>Carregando seus ingressos...</p>
                </div>
              ) : error ? (
                <div className="tickets-error">
                  <p>{error}</p>
                  <button onClick={() => fetchUserTickets(currentUser.id)} className="btn-retry-tickets">Recarregar</button>
                </div>
              ) : tickets.length === 0 ? (
                <div className="tickets-empty">
                  <div className="empty-icon">🎟️</div>
                  <h4>Você ainda não tem nenhum ingresso</h4>
                  <p>Explore nossos eventos ativos e garanta sua presença!</p>
                  <Link to="/" className="btn-explore-events">Ver Eventos Disponíveis</Link>
                </div>
              ) : (
                <div className="tickets-list">
                  {tickets.map(ticket => {
                    const eventDate = ticket.eventTicket?.event?.date 
                      ? new Date(ticket.eventTicket.event.date)
                      : null;
                    const isExpired = eventDate && eventDate < new Date();
                    
                    let statusClass = 'active';
                    let statusText = 'Ativo';

                    if (ticket.isUsed) {
                      statusClass = 'used';
                      statusText = 'Utilizado';
                    } else if (isExpired) {
                      statusClass = 'expired';
                      statusText = 'Expirado';
                    }

                    return (
                      <div key={ticket.id} className={`ticket-card-item ${statusClass}`}>
                        <div className="ticket-card-left">
                          <span className={`ticket-status-badge ${statusClass}`}>{statusText}</span>
                          <h4 className="ticket-event-name">{ticket.eventTicket?.event?.name || 'Evento'}</h4>
                          <p className="ticket-event-details">
                            <span>📍 {ticket.eventTicket?.event?.address || 'Local não informado'}</span>
                            <span>📅 {eventDate ? eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data não informada'}</span>
                          </p>
                        </div>
                        
                        <div className="ticket-card-middle">
                          <div className="ticket-type-badge-item">
                            {getTicketTypeLabel(ticket.eventTicket?.type)}
                          </div>
                          <span className="ticket-id-label">ID: {ticket.id}</span>
                          <span className="ticket-price-label">R$ {ticket.priceFinal.toFixed(2)}</span>
                        </div>

                        <div className="ticket-card-right-actions">
                          {!ticket.isUsed && !isExpired && (
                            <>
                              <button onClick={() => handleCheckIn(ticket.id)} className="btn-ticket-checkin">
                                Realizar Check-in
                              </button>
                              <button onClick={() => handleCancelTicket(ticket.id)} className="btn-ticket-cancel">
                                Cancelar Ingresso
                              </button>
                            </>
                          )}
                          {ticket.isUsed && (
                            <span className="checked-in-msg">✓ Entrada Validada às {ticket.usedAt ? new Date(ticket.usedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          )}
                          {isExpired && !ticket.isUsed && (
                            <span className="expired-msg">Evento encerrado</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
