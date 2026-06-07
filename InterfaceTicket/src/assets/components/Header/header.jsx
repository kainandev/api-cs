/**
 * header.jsx — Componente de Cabeçalho Global
 *
 * Responsabilidades:
 * - Exibir a marca (logo) da plataforma
 * - Navegação principal entre páginas
 * - Autenticação: login, cadastro e logout
 * - Modal de login/cadastro
 *
 * Fluxo de autenticação:
 * - O usuário é salvo no localStorage do navegador como JSON
 * - Ao fazer login, o objeto User é recuperado e exibido no header
 * - Ao sair, o localStorage é limpo e o estado é redefinido
 *
 * Comunicação entre componentes:
 * - Usa eventos customizados (window.dispatchEvent) para notificar
 *   outras páginas quando o usuário muda (login/logout)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../services/api';
import { Icon } from '../icons/icons';
import './header.css';

function Header() {
    // ── Estado: usuário logado ──
    const [currentUser, setCurrentUser] = useState(null);

    // ── Estado: modal de autenticação ──
    const [showModal, setShowModal] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // ── Estado: campos do formulário de login ──
    const [loginEmail, setLoginEmail] = useState('');

    // ── Estado: campos do formulário de cadastro ──
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');

    // ── Estado: menu dropdown do usuário ──
    const [showUserMenu, setShowUserMenu] = useState(false);

    // ── Estado: feedback de erros ──
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation(); // Para destacar o link ativo

    // Lê o usuário do localStorage ao montar o componente
    const loadUser = () => {
        const raw = localStorage.getItem('event_ticket_user');
        setCurrentUser(raw ? JSON.parse(raw) : null);
    };

    useEffect(() => {
        loadUser();

        // Escuta o evento 'userChanged' — disparado por qualquer página
        // quando o usuário faz login ou logout
        const handleUserChange = () => loadUser();
        const handleOpenAuth = () => {
            setShowModal(true);
            setIsRegistering(false);
            setError('');
        };

        window.addEventListener('userChanged', handleUserChange);
        window.addEventListener('openAuthModal', handleOpenAuth);

        return () => {
            window.removeEventListener('userChanged', handleUserChange);
            window.removeEventListener('openAuthModal', handleOpenAuth);
        };
    }, []);

    // Fecha o menu do usuário ao clicar fora dele
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.user-menu-wrapper')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('event_ticket_user');
        setCurrentUser(null);
        setShowUserMenu(false);
        window.dispatchEvent(new Event('userChanged'));
        navigate('/');
    };

    // ── Login: busca o usuário pelo e-mail ──
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!loginEmail.trim()) {
            setError('Por favor, insira seu e-mail.');
            setLoading(false);
            return;
        }

        try {
            // Busca todos os usuários e encontra o que tem o e-mail informado.
            // Em produção, isso seria feito com um endpoint de autenticação real.
            const users = await api.users.getAll();
            const found = users.find(
                u => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
            );

            if (found) {
                localStorage.setItem('event_ticket_user', JSON.stringify(found));
                setCurrentUser(found);
                window.dispatchEvent(new Event('userChanged'));
                closeModal();
            } else {
                setError('E-mail não encontrado. Crie uma conta para continuar.');
            }
        } catch {
            setError('Não foi possível conectar ao servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // ── Cadastro: cria um novo usuário na API ──
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!firstName.trim() || !lastName.trim() || !cpf.trim() || !email.trim() || !dob) {
            setError('Preencha todos os campos para continuar.');
            setLoading(false);
            return;
        }

        try {
            const newUser = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                cpf: cpf.trim(),
                email: email.trim().toLowerCase(),
                dateOfBirth: new Date(dob).toISOString(),
            };

            const created = await api.users.create(newUser);
            localStorage.setItem('event_ticket_user', JSON.stringify(created));
            setCurrentUser(created);
            window.dispatchEvent(new Event('userChanged'));
            closeModal();
        } catch (err) {
            setError(err.message || 'Erro ao criar conta. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
        setLoginEmail('');
        setFirstName('');
        setLastName('');
        setCpf('');
        setEmail('');
        setDob('');
    };

    // Determina se um link está ativo (para destacar na navegação)
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className="header">
                {/* Logo / Marca */}
                <Link to="/" className="header-brand">
                    <div className="brand-icon">
                        <Icon name="ticket" size={18} />
                    </div>
                    <span className="brand-name">EventTicket</span>
                </Link>

                {/* Navegação principal — foco em descobrir eventos e comprar ingressos */}
                <nav className="header-nav">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
                    >
                        <Icon name="home" size={16} />
                        Eventos
                    </Link>

                    <Link
                        to="/meus-ingressos"
                        className={`nav-link ${isActive('/meus-ingressos') ? 'nav-link--active' : ''}`}
                    >
                        <Icon name="ticket" size={16} />
                        Meus Ingressos
                    </Link>

                    <Link
                        to="/sobre"
                        className={`nav-link ${isActive('/sobre') ? 'nav-link--active' : ''}`}
                    >
                        Sobre
                    </Link>
                </nav>

                {/* Área de autenticação / perfil */}
                <div className="header-auth">
                    {currentUser ? (
                        <div className="user-menu-wrapper">
                            {/* Botão do avatar — abre o menu dropdown */}
                            <button
                                className="user-avatar-btn"
                                onClick={() => setShowUserMenu(v => !v)}
                                aria-label="Menu do usuário"
                            >
                                <div className="user-avatar">
                                    {/* Inicial do nome do usuário */}
                                    {currentUser.firstName.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name-display">
                                    {currentUser.firstName}
                                </span>
                                <Icon name="chevron-right" size={14}
                                    className={showUserMenu ? 'chevron-down' : ''}
                                />
                            </button>

                            {/* Menu dropdown */}
                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                                        <span>{currentUser.email}</span>
                                    </div>

                                    <div className="user-dropdown-divider" />

                                    <Link
                                        to="/perfil"
                                        className="user-dropdown-item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Icon name="user" size={15} />
                                        Meu Perfil
                                    </Link>

                                    {/* "Organizar" é uma funcionalidade adicional — não é o foco principal */}
                                    <Link
                                        to="/organizar"
                                        className="user-dropdown-item"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Icon name="shield" size={15} />
                                        Organizar Eventos
                                    </Link>

                                    <div className="user-dropdown-divider" />

                                    <button
                                        className="user-dropdown-item user-dropdown-item--danger"
                                        onClick={handleLogout}
                                    >
                                        <Icon name="log-out" size={15} />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className="btn-login"
                            onClick={() => { setShowModal(true); setIsRegistering(false); }}
                        >
                            <Icon name="log-in" size={16} />
                            Entrar
                        </button>
                    )}
                </div>
            </header>

            {/* ── Modal de autenticação ── */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-card">
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Fechar">
                            <Icon name="x" size={20} />
                        </button>

                        {!isRegistering ? (
                            /* Formulário de Login */
                            <form onSubmit={handleLogin} className="auth-form">
                                <div className="auth-form-header">
                                    <div className="auth-icon-wrapper">
                                        <Icon name="user" size={24} />
                                    </div>
                                    <h2>Acessar Conta</h2>
                                    <p>Entre com seu e-mail para comprar ingressos e ver seu histórico</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger">
                                        <Icon name="alert-circle" size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="form-field">
                                    <label className="form-label" htmlFor="loginEmail">E-mail</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        id="loginEmail"
                                        placeholder="seu@email.com"
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                    style={{ width: '100%', marginTop: '8px' }}
                                >
                                    {loading
                                        ? <><Icon name="loader" size={16} />Entrando...</>
                                        : <><Icon name="log-in" size={16} />Entrar</>
                                    }
                                </button>

                                <p className="auth-toggle-text">
                                    Não tem uma conta?{' '}
                                    <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => { setIsRegistering(true); setError(''); }}
                                    >
                                        Criar conta gratuita
                                    </button>
                                </p>
                            </form>
                        ) : (
                            /* Formulário de Cadastro */
                            <form onSubmit={handleRegister} className="auth-form">
                                <div className="auth-form-header">
                                    <div className="auth-icon-wrapper">
                                        <Icon name="user" size={24} />
                                    </div>
                                    <h2>Criar Conta</h2>
                                    <p>Preencha seus dados para começar a adquirir ingressos</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger">
                                        <Icon name="alert-circle" size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="form-row-two">
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="firstName">Nome</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            id="firstName"
                                            placeholder="João"
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="lastName">Sobrenome</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            id="lastName"
                                            placeholder="Silva"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="form-label" htmlFor="regEmail">E-mail</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        id="regEmail"
                                        placeholder="joao@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-row-two">
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="cpf">CPF</label>
                                        <input
                                            className="form-input"
                                            type="text"
                                            id="cpf"
                                            placeholder="000.000.000-00"
                                            value={cpf}
                                            onChange={e => setCpf(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label" htmlFor="dob">Nascimento</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            id="dob"
                                            value={dob}
                                            onChange={e => setDob(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                    style={{ width: '100%', marginTop: '8px' }}
                                >
                                    {loading
                                        ? <><Icon name="loader" size={16} />Criando conta...</>
                                        : <><Icon name="check" size={16} />Criar Conta</>
                                    }
                                </button>

                                <p className="auth-toggle-text">
                                    Já tem uma conta?{' '}
                                    <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => { setIsRegistering(false); setError(''); }}
                                    >
                                        Fazer login
                                    </button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;