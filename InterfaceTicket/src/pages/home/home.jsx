import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import './home.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await api.events.getAll();
        // Sort events: active and upcoming first
        const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
      } catch (err) {
        setError('Não foi possível carregar os eventos. Verifique se o servidor backend está rodando.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getMinAgeText = (age) => {
    return age === 0 ? 'Classificação: Livre' : `Classificação: +${age} anos`;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <Header />
      <div className="home-container">
        
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Encontre os Melhores Eventos</h1>
            <p>Garanta seus ingressos de forma rápida, segura e 100% digital.</p>
            
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar por show, festival, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <main className="events-section">
          <div className="section-header">
            <h2>Próximos Eventos</h2>
            <p className="section-subtitle">Fique por dentro das datas e garanta sua presença</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando eventos...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-msg">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-retry">Tentar Novamente</button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>Nenhum evento encontrado</h3>
              <p>Não encontramos eventos com o termo pesquisado ou não há eventos cadastrados.</p>
              <Link to="/admin" className="btn-goto-admin">Cadastrar Evento (Painel Admin)</Link>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const isUpcoming = new Date(event.date) > new Date();
                const isCancelled = event.status === 'Cancelled' || event.status === 1;

                return (
                  <div key={event.id} className={`event-card ${isCancelled ? 'cancelled-card' : ''}`}>
                    <div className="event-card-header">
                      <span className="event-date-badge">
                        {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                      {isCancelled && <span className="status-badge cancelled">Cancelado</span>}
                      {!isUpcoming && !isCancelled && <span className="status-badge expired">Encerrado</span>}
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-title">{event.name}</h3>
                      <p className="event-info-item">
                        <span className="info-icon">📍</span> {event.address}
                      </p>
                      <p className="event-info-item">
                        <span className="info-icon">📅</span> {formatDate(event.date)}
                      </p>
                      <div className="event-card-footer">
                        <span className="age-badge">{getMinAgeText(event.minAge)}</span>
                        {isCancelled ? (
                          <button disabled className="btn-event-disabled">Indisponível</button>
                        ) : (
                          <Link to={`/evento/${event.id}`} className="btn-event-details">
                            Ver Ingressos
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}