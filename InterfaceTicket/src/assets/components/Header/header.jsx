import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import './header.css';

function Header() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  
  // Register form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    
    // Listen for custom login events from other pages
    const handleUserChange = () => {
      loadUser();
    };
    const handleOpenAuth = () => {
      setShowModal(true);
      setIsRegistering(false);
    };
    window.addEventListener('userChanged', handleUserChange);
    window.addEventListener('openAuthModal', handleOpenAuth);
    
    return () => {
      window.removeEventListener('userChanged', handleUserChange);
      window.removeEventListener('openAuthModal', handleOpenAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('event_ticket_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('userChanged'));
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail.trim()) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    try {
      // Fetch all users and find matching email (case insensitive)
      const users = await api.users.getAll();
      const foundUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase().trim());
      
      if (foundUser) {
        localStorage.setItem('event_ticket_user', JSON.stringify(foundUser));
        setCurrentUser(foundUser);
        window.dispatchEvent(new Event('userChanged'));
        setShowModal(false);
        setLoginEmail('');
      } else {
        setError('Usuário não encontrado. Se é sua primeira vez, clique em "Criar Conta".');
      }
    } catch (err) {
      setError(err.message || 'Falha ao realizar login.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !cpf.trim() || !email.trim() || !dob) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const newUser = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        cpf: cpf.trim(),
        email: email.trim().toLowerCase(),
        dateOfBirth: new Date(dob).toISOString(),
        status: 0 // Active
      };

      const createdUser = await api.users.create(newUser);
      localStorage.setItem('event_ticket_user', JSON.stringify(createdUser));
      setCurrentUser(createdUser);
      window.dispatchEvent(new Event('userChanged'));
      setShowModal(false);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setCpf('');
      setEmail('');
      setDob('');
    } catch (err) {
      setError(err.message || 'Erro ao registrar usuário.');
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      setShowModal(false);
      setError('');
    }
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="logo-link">
          <h3 className="logo">Event Ticket</h3>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Início</Link></li>
          <li><Link to="/meus-ingressos">Meus Ingressos</Link></li>
          <li><Link to="/admin">Painel Admin</Link></li>
          <li><Link to="/sobre">Sobre Nós</Link></li>
        </ul>
        
        <ul className="auth-links">
          {currentUser ? (
            <li className="user-profile">
              <span className="welcome-text">Olá, <strong>{currentUser.firstName}</strong></span>
              <button onClick={handleLogout} className="btn-logout">Sair</button>
            </li>
          ) : (
            <li>
              <button onClick={() => { setShowModal(true); setIsRegistering(false); }} className="btn-login-header">
                Entrar / Cadastrar
              </button>
            </li>
          )}
        </ul>
      </header>

      {showModal && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            
            {!isRegistering ? (
              <form onSubmit={handleLogin} className="auth-form">
                <h2>Acessar Minha Conta</h2>
                <p className="auth-subtitle">Entre com seu e-mail para ver seus ingressos e realizar compras</p>
                
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
                
                <button type="submit" className="btn-primary-auth">Entrar</button>
                
                <div className="auth-toggle">
                  Não tem uma conta?{' '}
                  <button type="button" onClick={() => { setIsRegistering(true); setError(''); }} className="btn-link-auth">
                    Criar Conta
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <h2>Criar Conta</h2>
                <p className="auth-subtitle">Preencha seus dados para começar a adquirir ingressos</p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <div className="form-row">
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cpf">CPF</label>
                    <input
                      type="text"
                      id="cpf"
                      placeholder="123.456.789-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
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

                <button type="submit" className="btn-primary-auth">Registrar e Acessar</button>
                
                <div className="auth-toggle">
                  Já tem uma conta?{' '}
                  <button type="button" onClick={() => { setIsRegistering(false); setError(''); }} className="btn-link-auth">
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