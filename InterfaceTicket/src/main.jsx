/**
 * main.jsx — Ponto de entrada da aplicação React
 *
 * Este é o arquivo que o Vite usa para inicializar tudo.
 * Ele conecta o React ao elemento <div id="root"> do index.html.
 *
 * StrictMode: modo de desenvolvimento que ajuda a encontrar problemas
 * comuns — pode renderizar os componentes duas vezes em desenvolvimento,
 * mas isso é intencional e não afeta a versão final (build de produção).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// CSS global com os design tokens (cores, tipografia, espaçamentos)
import './index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);