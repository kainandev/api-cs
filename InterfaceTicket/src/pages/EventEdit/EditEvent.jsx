import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import './EditEvent.css';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [eventData, setEventData] = useState({
    name: '',
    address: '',
    description: '',
    date: '',
    minAge: 0,
    status: 0
  });

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const event = await api.events.getById(id);

      setEventData({
        name: event.name || '',
        address: event.address || '',
        description: event.description || '',
        date: event.date
          ? new Date(event.date).toISOString().slice(0, 16)
          : '',
        minAge: event.minAge || 0,
        status: event.status ?? 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      await api.events.update(id, {
        ...eventData,
        date: new Date(eventData.date).toISOString()
      });

      alert('Evento atualizado com sucesso');

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="edit-event-container">
          <h2>Carregando evento...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="edit-event-container">

        <div className="edit-event-card">
          <h1>Editar Evento</h1>

          {error && (
            <div className="edit-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nome do Evento</label>
              <input
                type="text"
                value={eventData.name}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    name: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Local</label>
              <input
                type="text"
                value={eventData.address}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    address: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Data e Hora</label>
              <input
                type="datetime-local"
                value={eventData.date}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    date: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Idade Mínima</label>
              <input
                type="number"
                min="0"
                value={eventData.minAge}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    minAge: Number(e.target.value)
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                rows="6"
                value={eventData.description}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    description: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={eventData.status}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    status: Number(e.target.value)
                  })
                }
              >
                <option value="0">Ativo</option>
                <option value="1">Cancelado</option>
              </select>
            </div>

            <div className="edit-actions">
              <button
                type="submit"
                disabled={saving}
                className="btn-save-event"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>

              <button
                type="button"
                className="btn-cancel-event"
                onClick={() => navigate('/admin')}
              >
                Voltar
              </button>
            </div>

          </form>
        </div>

      </div>
    </>
  );
}