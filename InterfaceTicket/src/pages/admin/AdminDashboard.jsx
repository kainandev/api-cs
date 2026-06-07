import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'create-event', 'create-batch', 'reports'

  const navigate = useNavigate();
  
  // Selected event for reports
  const [selectedReportEventId, setSelectedReportEventId] = useState('');
  const [eventSummary, setEventSummary] = useState(null);
  const [eventAttendees, setEventAttendees] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  // Forms loading/error states
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Event form state
  const [eventName, setEventName] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventMinAge, setEventMinAge] = useState(0);

  // Batch form state
  const [batchEventId, setBatchEventId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [batchType, setBatchType] = useState(0); // 0 = Normal, 1 = Half, 2 = VIP
  const [batchPrice, setBatchPrice] = useState('');
  const [batchTotalAmount, setBatchTotalAmount] = useState('');
  const [batchSalesStart, setBatchSalesStart] = useState('');
  const [batchSalesEnd, setBatchSalesEnd] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await api.events.getAll();
      setEvents(data);
      if (data.length > 0 && !selectedReportEventId) {
        setSelectedReportEventId(data[0].id.toString());
      }
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    }
  };

  // Load report data
  useEffect(() => {
    if (selectedReportEventId && activeTab === 'reports') {
      loadReport(parseInt(selectedReportEventId));
    }
  }, [selectedReportEventId, activeTab]);

  const loadReport = async (eventId) => {
    setLoadingReport(true);
    setFormError('');
    try {
      const summary = await api.events.getSummary(eventId);
      setEventSummary(summary);
      const attendees = await api.events.getAttendees(eventId);
      setEventAttendees(attendees);
    } catch (err) {
      setFormError('Erro ao carregar relatório: ' + err.message);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    if (!eventName.trim() || !eventAddress.trim() || !eventDate) {
      setFormError('Preencha os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const newEvent = {
        name: eventName.trim(),
        address: eventAddress.trim(),
        description: eventDescription.trim(),
        date: new Date(eventDate).toISOString(),
        minAge: parseInt(eventMinAge),
        status: 0 // Active
      };

      await api.events.create(newEvent);
      setFormSuccess('Evento criado com sucesso!');
      
      // Reset form
      setEventName('');
      setEventAddress('');
      setEventDescription('');
      setEventDate('');
      setEventMinAge(0);
      
      await fetchEvents();
    } catch (err) {
      setFormError(err.message || 'Erro ao criar evento.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    if (!batchEventId || !batchName.trim() || !batchPrice || !batchTotalAmount || !batchSalesStart || !batchSalesEnd) {
      setFormError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const newBatch = {
        eventId: parseInt(batchEventId),
        name: batchName.trim(),
        description: batchDescription.trim(),
        type: parseInt(batchType),
        price: parseFloat(batchPrice),
        totalAmount: parseInt(batchTotalAmount),
        soldAmount: 0,
        salesStart: new Date(batchSalesStart).toISOString(),
        salesEnd: new Date(batchSalesEnd).toISOString(),
        isActive: true
      };

      await api.eventTickets.create(newBatch);
      setFormSuccess('Lote de ingressos criado com sucesso!');

      // Reset form
      setBatchName('');
      setBatchDescription('');
      setBatchType(0);
      setBatchPrice('');
      setBatchTotalAmount('');
      setBatchSalesStart('');
      setBatchSalesEnd('');
      
      if (selectedReportEventId) {
        loadReport(parseInt(selectedReportEventId));
      }
    } catch (err) {
      setFormError(err.message || 'Erro ao criar lote.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (ticketId) => {
    try {
      await api.tickets.checkIn(ticketId);
      alert('Check-in efetuado com sucesso!');
      if (selectedReportEventId) {
        loadReport(parseInt(selectedReportEventId));
      }
    } catch (err) {
      alert(err.message || 'Erro ao validar check-in.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Deseja realmente excluir este evento? Esta ação não pode ser desfeita e só funcionará se não houver ingressos vendidos.')) {
      return;
    }

    try {
      await api.events.delete(eventId);
      alert('Evento excluído com sucesso.');
      await fetchEvents();
    } catch (err) {
      alert(err.message || 'Erro ao excluir evento.');
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
      <div className="admin-container">
        
        {/* Admin Navigation */}
        <nav className="admin-tabs-nav">
          <button onClick={() => { setActiveTab('events'); setFormError(''); setFormSuccess(''); }} className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}>
            📅 Eventos Cadastrados
          </button>
          <button onClick={() => { setActiveTab('create-event'); setFormError(''); setFormSuccess(''); }} className={`tab-btn ${activeTab === 'create-event' ? 'active' : ''}`}>
            ➕ Novo Evento
          </button>
          <button onClick={() => { setActiveTab('create-batch'); setFormError(''); setFormSuccess(''); }} className={`tab-btn ${activeTab === 'create-batch' ? 'active' : ''}`}>
            🎟️ Criar Lote de Ingressos
          </button>
          <button onClick={() => { setActiveTab('reports'); setFormError(''); setFormSuccess(''); }} className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}>
            📊 Relatórios & Portaria
          </button>
        </nav>

        <main className="admin-main">
          
          {/* TAB 1: LIST EVENTS */}
          {activeTab === 'events' && (
            <div className="admin-panel">
              <h2>Eventos Cadastrados</h2>
              <p className="panel-desc">Lista geral de eventos. Você pode gerenciar ou excluí-los caso nenhum ingresso tenha sido vendido.</p>
              
              {events.length === 0 ? (
                <div className="admin-empty-state">
                  <p>Nenhum evento cadastrado no sistema.</p>
                  <button onClick={() => setActiveTab('create-event')} className="btn-tab-trigger">Criar Primeiro Evento</button>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Data</th>
                        <th>Local</th>
                        <th>Idade Mín.</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(ev => {
                        const eventDate = new Date(ev.date);
                        const isExpired = eventDate < new Date();
                        return (
                          <tr key={ev.id}>
                            <td>{ev.id}</td>
                            <td><strong>{ev.name}</strong></td>
                            <td>{eventDate.toLocaleDateString('pt-BR')} {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{ev.address}</td>
                            <td>{ev.minAge === 0 ? 'Livre' : `+${ev.minAge}`}</td>
                            <td>
                              <span className={`admin-status-badge ${ev.status === 'Cancelled' || ev.status === 1 ? 'cancelled' : isExpired ? 'expired' : 'active'}`}>
                                {ev.status === 'Cancelled' || ev.status === 1 ? 'Cancelado' : isExpired ? 'Encerrado' : 'Ativo'}
                              </span>
                            </td>
                            <td className="table-actions">
                              <button
                                onClick={() => navigate(`/admin/events/${ev.id}/edit`)} className="btn-table-edit">
                                Editar
                              </button>

                              <button
                                onClick={() => handleDeleteEvent(ev.id)} className="btn-table-delete">
                                Excluir
                              </button>

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

          {/* TAB 2: CREATE EVENT */}
          {activeTab === 'create-event' && (
            <div className="admin-panel">
              <h2>Novo Evento</h2>
              <p className="panel-desc">Crie um novo evento preenchendo as informações abaixo. Lotes de ingressos poderão ser criados em seguida.</p>
              
              {formError && <div className="admin-error-msg">{formError}</div>}
              {formSuccess && <div className="admin-success-msg">{formSuccess}</div>}

              <form onSubmit={handleCreateEvent} className="admin-form">
                <div className="form-group-admin">
                  <label htmlFor="eventName">Nome do Evento *</label>
                  <input
                    type="text"
                    id="eventName"
                    placeholder="Ex: Show de Rock da Independência"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-admin">
                  <label htmlFor="eventAddress">Local / Endereço *</label>
                  <input
                    type="text"
                    id="eventAddress"
                    placeholder="Ex: Teatro Municipal, São Paulo - SP"
                    value={eventAddress}
                    onChange={(e) => setEventAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-admin">
                  <div className="form-group-admin">
                    <label htmlFor="eventDate">Data e Hora *</label>
                    <input
                      type="datetime-local"
                      id="eventDate"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group-admin">
                    <label htmlFor="eventMinAge">Idade Mínima</label>
                    <input
                      type="number"
                      id="eventMinAge"
                      min="0"
                      max="100"
                      value={eventMinAge}
                      onChange={(e) => setEventMinAge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-admin">
                  <label htmlFor="eventDescription">Descrição do Evento</label>
                  <textarea
                    id="eventDescription"
                    rows="4"
                    placeholder="Destaques do show, informações sobre estacionamento, acessibilidade..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className="btn-submit-admin">
                  {loading ? 'Criando Evento...' : 'Salvar Evento'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CREATE BATCH */}
          {activeTab === 'create-batch' && (
            <div className="admin-panel">
              <h2>Criar Lote de Ingressos</h2>
              <p className="panel-desc">Defina os preços, quantidades e períodos de vendas para os ingressos de um evento.</p>

              {formError && <div className="admin-error-msg">{formError}</div>}
              {formSuccess && <div className="admin-success-msg">{formSuccess}</div>}

              {events.length === 0 ? (
                <div className="admin-empty-state">
                  <p>Você precisa criar um evento antes de cadastrar lotes.</p>
                  <button onClick={() => setActiveTab('create-event')} className="btn-tab-trigger">Criar Evento</button>
                </div>
              ) : (
                <form onSubmit={handleCreateBatch} className="admin-form">
                  <div className="form-group-admin">
                    <label htmlFor="batchEventId">Selecione o Evento *</label>
                    <select
                      id="batchEventId"
                      value={batchEventId}
                      onChange={(e) => setBatchEventId(e.target.value)}
                      required
                    >
                      <option value="">-- Escolha um evento --</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.name} ({new Date(ev.date).toLocaleDateString('pt-BR')})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row-admin">
                    <div className="form-group-admin">
                      <label htmlFor="batchName">Nome do Lote *</label>
                      <input
                        type="text"
                        id="batchName"
                        placeholder="Ex: Lote 1, Promo, Lote VIP"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group-admin">
                      <label htmlFor="batchType">Tipo de Ingresso *</label>
                      <select
                        id="batchType"
                        value={batchType}
                        onChange={(e) => setBatchType(e.target.value)}
                        required
                      >
                        <option value="0">Normal (Preço Base)</option>
                        <option value="1">Meia-Entrada (50% desc.)</option>
                        <option value="2">VIP (150% acrésc.)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-admin">
                    <div className="form-group-admin">
                      <label htmlFor="batchPrice">Preço Base (R$) *</label>
                      <input
                        type="number"
                        id="batchPrice"
                        min="0"
                        step="0.01"
                        placeholder="100.00"
                        value={batchPrice}
                        onChange={(e) => setBatchPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group-admin">
                      <label htmlFor="batchTotalAmount">Quantidade Total *</label>
                      <input
                        type="number"
                        id="batchTotalAmount"
                        min="1"
                        placeholder="150"
                        value={batchTotalAmount}
                        onChange={(e) => setBatchTotalAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-admin">
                    <div className="form-group-admin">
                      <label htmlFor="batchSalesStart">Início das Vendas *</label>
                      <input
                        type="datetime-local"
                        id="batchSalesStart"
                        value={batchSalesStart}
                        onChange={(e) => setBatchSalesStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group-admin">
                      <label htmlFor="batchSalesEnd">Término das Vendas *</label>
                      <input
                        type="datetime-local"
                        id="batchSalesEnd"
                        value={batchSalesEnd}
                        onChange={(e) => setBatchSalesEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label htmlFor="batchDescription">Descrição do Lote</label>
                    <input
                      type="text"
                      id="batchDescription"
                      placeholder="Ex: Acesso à pista premium, inclui copo colecionável..."
                      value={batchDescription}
                      onChange={(e) => setBatchDescription(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-submit-admin">
                    {loading ? 'Salvando Lote...' : 'Criar Lote'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: REPORTS & CHECKIN */}
          {activeTab === 'reports' && (
            <div className="admin-panel">
              <h2>Relatórios Financeiros e Portaria (Check-in)</h2>
              <p className="panel-desc">Acompanhe as vendas de cada lote em tempo real e realize a validação manual de ingressos na portaria.</p>

              {events.length === 0 ? (
                <div className="admin-empty-state">
                  <p>Nenhum evento disponível para análise.</p>
                </div>
              ) : (
                <div className="reports-section">
                  <div className="report-selector">
                    <label htmlFor="reportEventId">Selecione o Evento:</label>
                    <select
                      id="reportEventId"
                      value={selectedReportEventId}
                      onChange={(e) => setSelectedReportEventId(e.target.value)}
                    >
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.name} ({new Date(ev.date).toLocaleDateString('pt-BR')})</option>
                      ))}
                    </select>
                  </div>

                  {loadingReport ? (
                    <div className="report-loading">
                      <div className="spinner"></div>
                      <p>Carregando relatórios...</p>
                    </div>
                  ) : eventSummary ? (
                    <div className="report-data">
                      {/* Summary Blocks */}
                      <div className="summary-blocks">
                        <div className="summary-block card-revenue">
                          <span className="block-label">Receita Estimada</span>
                          <strong className="block-value">R$ {eventSummary.totalRevenue.toFixed(2)}</strong>
                        </div>
                        <div className="summary-block card-sold">
                          <span className="block-label">Ingressos Vendidos</span>
                          <strong className="block-value">{eventSummary.totalSold} / {eventSummary.totalCapacity}</strong>
                        </div>
                        <div className="summary-block card-spots">
                          <span className="block-label">Vagas Restantes</span>
                          <strong className="block-value">{eventSummary.remainingSpots}</strong>
                        </div>
                        <div className="summary-block card-avg">
                          <span className="block-label">Preço Médio do Ingresso</span>
                          <strong className="block-value">R$ {eventSummary.averageTicketPrice.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Batches Table */}
                      <div className="report-details-box">
                        <h3>Desempenho por Lotes</h3>
                        <table className="admin-table mini-table">
                          <thead>
                            <tr>
                              <th>Lote</th>
                              <th>Tipo</th>
                              <th>Preço Base</th>
                              <th>Vendidos</th>
                              <th>Disponíveis</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventSummary.batches.map((batch, index) => (
                              <tr key={index}>
                                <td><strong>{batch.batchName}</strong></td>
                                <td>{getTicketTypeLabel(parseInt(batch.type))}</td>
                                <td>R$ {batch.price.toFixed(2)}</td>
                                <td>{batch.sold}</td>
                                <td>{batch.available}</td>
                                <td>
                                  <span className={`mini-status-badge ${batch.isActive ? 'active' : 'inactive'}`}>
                                    {batch.isActive ? 'Vendas Ativas' : 'Inativo'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Attendees Check-In Portaria */}
                      <div className="report-details-box">
                        <h3>Portaria / Lista de Presença ({eventAttendees.filter(a => a.checkedIn).length} check-ins)</h3>
                        <p className="box-desc">Valide a entrada dos participantes manualmente buscando pelo código do ingresso.</p>
                        
                        {eventAttendees.length === 0 ? (
                          <p className="no-attendees-msg">Nenhum participante comprou ingresso para este evento ainda.</p>
                        ) : (
                          <div className="admin-table-wrapper">
                            <table className="admin-table text-left-table">
                              <thead>
                                <tr>
                                  <th>Código Ingresso</th>
                                  <th>ID Usuário</th>
                                  <th>Lote / Tipo</th>
                                  <th>Preço Pago</th>
                                  <th>Status Entrada</th>
                                  <th>Ações Entrada</th>
                                </tr>
                              </thead>
                              <tbody>
                                {eventAttendees.map((att, i) => (
                                  <tr key={i} className={att.checkedIn ? 'checked-in-row' : ''}>
                                    <td><code className="table-code">{att.ticketId}</code></td>
                                    <td>{att.userId}</td>
                                    <td>{att.batchName} ({getTicketTypeLabel(parseInt(att.ticketType))})</td>
                                    <td>R$ {att.pricePaid.toFixed(2)}</td>
                                    <td>
                                      <span className={`status-badge-entrance ${att.checkedIn ? 'checked-in' : 'pending'}`}>
                                        {att.checkedIn ? 'Dentro' : 'Pendente'}
                                      </span>
                                    </td>
                                    <td>
                                      {!att.checkedIn ? (
                                        <button onClick={() => handleManualCheckIn(att.ticketId)} className="btn-entrance-checkin">
                                          Validar Entrada
                                        </button>
                                      ) : (
                                        <span className="entrance-time">Entrou às {new Date(att.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>Carregando dados...</p>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
}
