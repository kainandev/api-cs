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
    const [loginPassword, setLoginPassword] = useState('');

    // ── Estado: campos do formulário de cadastro ──
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');

    // ── Estado: menu dropdown do usuário ──
    const [showUserMenu, setShowUserMenu] = useState(false);

    // ── Estado: feedback de erros ──
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const loadUser = () => {
        const raw = localStorage.getItem('event_ticket_user');
        setCurrentUser(raw ? JSON.parse(raw) : null);
    };

    useEffect(() => {
        loadUser();

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
        localStorage.removeItem('event_ticket_token');
        setCurrentUser(null);
        setShowUserMenu(false);
        window.dispatchEvent(new Event('userChanged'));
        navigate('/');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!loginEmail.trim() || !loginPassword) {
            setError('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.auth.login({
                email: loginEmail.trim(),
                password: loginPassword
            });
            
            localStorage.setItem('event_ticket_token', response.token);
            localStorage.setItem('event_ticket_user', JSON.stringify(response.user));
            
            setCurrentUser(response.user);
            window.dispatchEvent(new Event('userChanged'));
            closeModal();
        } catch (err) {
            setError(err.message || 'Falha ao realizar login.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!firstName.trim() || !lastName.trim() || !cpf.trim() || !email.trim() || !password || !dob) {
            setError('Preencha todos os campos para continuar.');
            setLoading(false);
            return;
        }

        const cleanCpf = cpf.replace(/\D/g, '');

        if (!validateCPF(cleanCpf)) {
            setError('CPF inválido.');
            setLoading(false);
            return;
        }

        try {
            const newUser = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                cpf: cpf.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                dateOfBirth: new Date(dob).toISOString(),
            };

            await api.auth.register(newUser);
            
            // Auto login after register
            const loginResponse = await api.auth.login({
                email: newUser.email,
                password: newUser.password
            });

            localStorage.setItem('event_ticket_token', loginResponse.token);
            localStorage.setItem('event_ticket_user', JSON.stringify(loginResponse.user));
            
            setCurrentUser(loginResponse.user);
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
        setLoginPassword('');
        setFirstName('');
        setLastName('');
        setCpf('');
        setEmail('');
        setPassword('');
        setDob('');
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            closeModal();
        }
    };

    const isActive = (path) => location.pathname === path;

    function formatCPF(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1-$2')
            .slice(0, 14);
    }

    function validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;

        if (/^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;

        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf[i]) * (10 - i);
        }

        let digit = 11 - (sum % 11);

        if (digit >= 10) digit = 0;

        if (digit !== parseInt(cpf[9])) {
            return false;
        }

        sum = 0;

        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf[i]) * (11 - i);
        }

        digit = 11 - (sum % 11);

        if (digit >= 10) digit = 0;

        return digit === parseInt(cpf[10]);
    }

    return (
        <>
            <header className="header">
                <Link to="/" className="header-brand">
                    <div className="brand-icon">
                        <Icon name="ticket" size={18} />
                    </div>
                    <span className="brand-name">EventTicket</span>
                </Link>

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

                <div className="header-auth">
                    {currentUser ? (
                        <div className="user-menu-wrapper">
                            <button
                                className="user-avatar-btn"
                                onClick={() => setShowUserMenu(v => !v)}
                                aria-label="Menu do usuário"
                            >
                                <div className="user-avatar">
                                    {currentUser.firstName.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name-display">
                                    {currentUser.firstName}
                                </span>
                                <Icon name="chevron-right" size={14}
                                    className={showUserMenu ? 'chevron-down' : ''}
                                />
                            </button>

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

            {showModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-card">
                        <button className="modal-close-btn" onClick={closeModal}>&times;</button>
                        
                        {!isRegistering ? (
                            <form onSubmit={handleLogin} className="auth-form">
                                <h2>Acessar Minha Conta</h2>
                                <p className="auth-subtitle">Entre com seu e-mail e senha para ver seus ingressos</p>
                                
                                {error && <div className="auth-error">{error}</div>}
                                
                                <div className="form-group">
                                    <label htmlFor="loginEmail">E-mail</label>
                                    <input
                                        type="email"
                                        id="loginEmail"
                                        placeholder="exemplo@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="loginPassword">Senha</label>
                                    <input
                                        type="password"
                                        id="loginPassword"
                                        placeholder="Sua senha"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <button type="submit" className="btn-primary-auth" disabled={loading}>
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </button>
                                
                                <div className="auth-toggle-text">
                                    Não tem uma conta?{' '}
                                    <button type="button" onClick={() => { setIsRegistering(true); setError(''); }} className="link-btn">
                                        Criar Conta
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="auth-form">
                                <h2>Criar Conta</h2>
                                <p className="auth-subtitle">Preencha seus dados para começar a adquirir ingressos</p>
                                
                                {error && <div className="auth-error">{error}</div>}
                                
                                <div className="form-row-two">
                                    <div className="form-group">
                                        <label htmlFor="firstName">Nome</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            placeholder="João"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Sobrenome</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            placeholder="Silva"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">E-mail</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="joao.silva@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Senha</label>
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Crie uma senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-row-two">
                                    <div className="form-group">

                                        <label htmlFor="cpf">CPF</label>
                                        <input
                                            type="text"
                                            id="cpf"
                                            placeholder="000.000.000-00"
                                            value={cpf}
                                            maxLength={14}
                                            onChange={(e) => setCpf(formatCPF(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dob">Data de Nascimento</label>
                                        <input
                                            type="date"
                                            id="dob"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary-auth" disabled={loading}>
                                    {loading ? 'Registrando...' : 'Registrar e Acessar'}
                                </button>
                                
                                <div className="auth-toggle-text">
                                    Já tem uma conta?{' '}
                                    <button type="button" onClick={() => { setIsRegistering(false); setError(''); }} className="link-btn">
                                        Entrar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;
