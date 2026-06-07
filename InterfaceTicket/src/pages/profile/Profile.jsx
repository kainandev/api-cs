/**
 * ProfilePage.jsx — Página de Perfil do Usuário
 *
 * Permite ao usuário visualizar e editar suas informações pessoais.
 *
 * Rota da API utilizada:
 *   PUT /api/users/{id} — atualiza os dados do usuário
 *
 * Fluxo:
 * 1. Carrega os dados do usuário do localStorage
 * 2. Pré-preenche o formulário com os dados atuais
 * 3. Ao salvar, chama a API e atualiza o localStorage
 * 4. Exibe feedback de sucesso ou erro
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { api } from '../../services/api';
import { Icon } from '../../assets/components/icons/icons';
import './Profile.css';

export default function ProfilePage() {
    const navigate = useNavigate();

    // ── Estado: usuário atual ──
    const [currentUser, setCurrentUser] = useState(null);

    // ── Estado: modo de edição ──
    const [isEditing, setIsEditing] = useState(false);

    // ── Estado: campos do formulário ──
    const [firstName, setFirstName]   = useState('');
    const [lastName, setLastName]     = useState('');
    const [cpf, setCpf]               = useState('');
    const [email, setEmail]           = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    // ── Estado: feedback ──
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState('');
    const [error, setError]       = useState('');

    useEffect(() => {
        const raw = localStorage.getItem('event_ticket_user');
        if (!raw) {
            // Usuário não está logado: redireciona para a home
            navigate('/');
            return;
        }

        const user = JSON.parse(raw);
        setCurrentUser(user);
        populateForm(user);
    }, [navigate]);

    // Popula os campos do formulário com os dados do usuário
    const populateForm = (user) => {
        setFirstName(user.firstName || '');
        setLastName(user.lastName   || '');
        setCpf(user.cpf             || '');
        setEmail(user.email         || '');

        // Converte a data ISO para o formato YYYY-MM-DD esperado pelo input type="date"
        if (user.dateOfBirth) {
            setDateOfBirth(user.dateOfBirth.substring(0, 10));
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSuccess('');
        setError('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        // Restaura os valores originais
        if (currentUser) {
            populateForm(currentUser);
        }
    };

    // Salva as alterações chamando a API e atualizando o localStorage
    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!firstName.trim() || !lastName.trim() || !cpf.trim() || !email.trim() || !dateOfBirth) {
            setError('Todos os campos são obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            const updatedData = {
                firstName: firstName.trim(),
                lastName:  lastName.trim(),
                cpf:       cpf.trim(),
                email:     email.trim().toLowerCase(),
                // Converte de volta para ISO com timezone UTC
                dateOfBirth: new Date(dateOfBirth + 'T00:00:00Z').toISOString(),
            };

            // Chama PUT /api/users/{id}
            const updatedUser = await api.users.update(currentUser.id, updatedData);

            // Atualiza o estado local e o localStorage com os novos dados
            const newUser = { ...currentUser, ...updatedUser };
            setCurrentUser(newUser);
            localStorage.setItem('event_ticket_user', JSON.stringify(newUser));

            // Notifica outros componentes (ex: header) que o usuário mudou
            window.dispatchEvent(new Event('userChanged'));

            setSuccess('Perfil atualizado com sucesso!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Não foi possível atualizar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Calcula a idade do usuário a partir da data de nascimento
    const calculateAge = (dateString) => {
        if (!dateString) return null;
        const birth = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    // Formata a data para exibição amigável
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    if (!currentUser) return null;

    const age = calculateAge(currentUser.dateOfBirth);

    return (
        <>
            <Header />

            <main className="profile-container">
                <div className="profile-content">

                    {/* ── Cabeçalho da página ── */}
                    <div className="profile-page-header">
                        <Link to="/" className="btn btn-ghost btn-sm">
                            <Icon name="arrow-left" size={16} />
                            Voltar
                        </Link>
                        <h1>Meu Perfil</h1>
                    </div>

                    {/* ── Feedback de sucesso ── */}
                    {success && (
                        <div className="alert alert-success">
                            <Icon name="check-circle" size={18} />
                            {success}
                        </div>
                    )}

                    {/* ── Cartão do avatar + informações ── */}
                    <div className="profile-grid">

                        {/* Card lateral: avatar e resumo */}
                        <aside className="profile-sidebar">
                            <div className="avatar-card">
                                <div className="profile-avatar">
                                    {currentUser.firstName.charAt(0).toUpperCase()}
                                    {currentUser.lastName.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="profile-display-name">
                                    {currentUser.firstName} {currentUser.lastName}
                                </h2>
                                <p className="profile-display-email">{currentUser.email}</p>

                                {age !== null && (
                                    <div className="profile-age-badge">
                                        <Icon name="user" size={13} />
                                        {age} anos
                                    </div>
                                )}
                            </div>

                            {/* Status da conta */}
                            <div className="profile-status-card">
                                <h3>Status da Conta</h3>
                                <div className="status-row">
                                    <Icon name="check-circle" size={16} />
                                    <span>Conta ativa</span>
                                    <span className="badge badge-active">Ativo</span>
                                </div>
                                <div className="status-row">
                                    <Icon name="shield" size={16} />
                                    <span>CPF cadastrado</span>
                                    {currentUser.cpf && <span className="badge badge-active">OK</span>}
                                </div>
                            </div>

                            {/* Acesso rápido */}
                            <div className="profile-quick-links">
                                <Link to="/meus-ingressos" className="quick-link">
                                    <Icon name="ticket" size={16} />
                                    Ver meus ingressos
                                    <Icon name="chevron-right" size={14} />
                                </Link>
                                <Link to="/organizar" className="quick-link">
                                    <Icon name="shield" size={16} />
                                    Organizar eventos
                                    <Icon name="chevron-right" size={14} />
                                </Link>
                            </div>
                        </aside>

                        {/* Painel principal: formulário de dados */}
                        <div className="profile-main">
                            <div className="profile-form-card">
                                <div className="profile-form-header">
                                    <div>
                                        <h2>Informações Pessoais</h2>
                                        <p>Dados utilizados para compra de ingressos e identificação nos eventos.</p>
                                    </div>
                                    {!isEditing && (
                                        <button className="btn btn-secondary" onClick={handleEdit}>
                                            <Icon name="edit" size={15} />
                                            Editar
                                        </button>
                                    )}
                                </div>

                                {/* ── Modo visualização ── */}
                                {!isEditing && (
                                    <div className="profile-view">
                                        <div className="info-grid">
                                            <InfoField label="Nome" value={currentUser.firstName} icon="user" />
                                            <InfoField label="Sobrenome" value={currentUser.lastName} icon="user" />
                                            <InfoField label="E-mail" value={currentUser.email} icon="info" />
                                            <InfoField label="CPF" value={currentUser.cpf} icon="shield" />
                                            <InfoField
                                                label="Data de Nascimento"
                                                value={formatDateDisplay(currentUser.dateOfBirth)}
                                                icon="calendar"
                                            />
                                            {age !== null && (
                                                <InfoField label="Idade" value={`${age} anos`} icon="clock" />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Modo edição ── */}
                                {isEditing && (
                                    <form onSubmit={handleSave} className="profile-edit-form">
                                        {error && (
                                            <div className="alert alert-danger">
                                                <Icon name="alert-circle" size={16} />
                                                {error}
                                            </div>
                                        )}

                                        <div className="edit-grid">
                                            <div className="form-field">
                                                <label className="form-label" htmlFor="profFirstName">Nome</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    id="profFirstName"
                                                    value={firstName}
                                                    onChange={e => setFirstName(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-field">
                                                <label className="form-label" htmlFor="profLastName">Sobrenome</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    id="profLastName"
                                                    value={lastName}
                                                    onChange={e => setLastName(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label" htmlFor="profEmail">E-mail</label>
                                                <input
                                                    className="form-input"
                                                    type="email"
                                                    id="profEmail"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-field">
                                                <label className="form-label" htmlFor="profCpf">CPF</label>
                                                <input
                                                    className="form-input"
                                                    type="text"
                                                    id="profCpf"
                                                    value={cpf}
                                                    onChange={e => setCpf(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-field">
                                                <label className="form-label" htmlFor="profDob">Data de Nascimento</label>
                                                <input
                                                    className="form-input"
                                                    type="date"
                                                    id="profDob"
                                                    value={dateOfBirth}
                                                    onChange={e => setDateOfBirth(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={handleCancel}
                                                disabled={loading}
                                            >
                                                <Icon name="x" size={15} />
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? <><Icon name="loader" size={15} />Salvando...</>
                                                    : <><Icon name="save" size={15} />Salvar Alterações</>
                                                }
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

/**
 * InfoField — Campo de exibição de informação (modo visualização)
 * Mostra um rótulo, ícone e valor de forma limpa.
 */
function InfoField({ label, value, icon }) {
    return (
        <div className="info-field">
            <span className="info-field-label">
                <Icon name={icon} size={13} />
                {label}
            </span>
            <span className="info-field-value">{value || '—'}</span>
        </div>
    );
}