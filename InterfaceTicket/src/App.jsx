/**
 * App.jsx — Roteador Principal da Aplicação
 *
 * Define as rotas (URLs) disponíveis na aplicação.
 * Cada rota corresponde a uma página específica.
 *
 * Estrutura de URLs:
 *   /                → Home — Descoberta de eventos (foco principal)
 *   /evento/:id      → Detalhes e compra de ingresso
 *   /meus-ingressos  → Ingressos comprados pelo usuário
 *   /perfil          → Visualização e edição do perfil
 *   /organizar       → Painel do organizador (criar/editar eventos e lotes)
 *   /sobre           → Página institucional
 *   /admin           → Redireciona para /organizar (compatibilidade)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home         from '/src/pages/home/home.jsx';
import EventDetails from '/src/pages/eventDetails/EventDetails.jsx';
import MyTickets    from '/src/pages/myTickets/MyTickets.jsx';
import ProfilePage  from '/src/pages/profile/Profile.jsx';
import OrganizePage from '/src/pages/admin/AdminDashboard.jsx';
import Sobre        from '/src/pages/about/about.jsx';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Página principal — descoberta de eventos */}
                <Route path="/"               element={<Home />} />

                {/* Detalhes de um evento específico e compra de ingresso */}
                <Route path="/evento/:id"     element={<EventDetails />} />

                {/* Ingressos do usuário */}
                <Route path="/meus-ingressos" element={<MyTickets />} />

                {/* Perfil do usuário com edição */}
                <Route path="/perfil"         element={<ProfilePage />} />

                {/* Painel do organizador — criação e gerenciamento de eventos */}
                <Route path="/organizar"      element={<OrganizePage />} />

                {/* Compatibilidade: redireciona a URL antiga /admin para /organizar */}
                <Route path="/admin"          element={<Navigate to="/organizar" replace />} />

                {/* Página institucional */}
                <Route path="/sobre"          element={<Sobre />} />

                {/* Qualquer URL desconhecida vai para a home */}
                <Route path="*"               element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}