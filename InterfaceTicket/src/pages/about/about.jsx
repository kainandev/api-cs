/**
 * about.jsx — Página Sobre
 *
 * Apresentação da plataforma e das tecnologias utilizadas.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../assets/components/Header/header.jsx';
import { Icon } from '../../assets/components/icons/icons';
import './about.css';

export default function About() {
    return (
        <>
            <Header />

            <main className="about-page">
                <div className="about-content">

                    {/* ── Hero ── */}
                    <section className="about-hero">
                        <div className="about-logo">
                            <Icon name="ticket" size={36} />
                        </div>
                        <h1>Sobre o EventTicket</h1>
                        <p>
                            Uma plataforma moderna para criação, gerenciamento e venda de
                            ingressos digitais. Desenvolvida como projeto acadêmico com
                            foco em arquitetura limpa e boas práticas de desenvolvimento.
                        </p>
                    </section>

                    {/* ── Tecnologias ── */}
                    <section className="about-section">
                        <h2>Tecnologias Utilizadas</h2>
                        <div className="tech-grid">
                            <TechCard
                                icon="shield"
                                title="Backend: ASP.NET Core"
                                description="API REST em C# com .NET 10. Utiliza o padrão Repository para separar as camadas de acesso ao banco de dados do restante da aplicação."
                            />
                            <TechCard
                                icon="list"
                                title="Banco de Dados: SQLite + EF Core"
                                description="Banco de dados embutido, ideal para desenvolvimento. O Entity Framework Core faz o mapeamento entre os objetos C# e as tabelas do banco."
                            />
                            <TechCard
                                icon="trending-up"
                                title="Frontend: React + Vite"
                                description="Interface construída com React 19. Vite garante build rápido e hot-reload durante o desenvolvimento."
                            />
                            <TechCard
                                icon="tag"
                                title="Design System"
                                description="Ícones SVG próprios, tokens de design em CSS variables e teoria das cores aplicada para uma experiência consistente e acessível."
                            />
                        </div>
                    </section>

                    {/* ── Arquitetura ── */}
                    <section className="about-section">
                        <h2>Arquitetura da API</h2>
                        <div className="arch-diagram">
                            <div className="arch-layer">
                                <Icon name="eye" size={18}/>
                                <strong>Controller</strong>
                                <p>Recebe as requisições HTTP, valida os dados e retorna a resposta.</p>
                            </div>
                            <div className="arch-arrow">
                                <Icon name="chevron-right" size={20}/>
                            </div>
                            <div className="arch-layer">
                                <Icon name="list" size={18}/>
                                <strong>Repository</strong>
                                <p>Interface de acesso ao banco. Separa as regras de negócio do SQL.</p>
                            </div>
                            <div className="arch-arrow">
                                <Icon name="chevron-right" size={20}/>
                            </div>
                            <div className="arch-layer">
                                <Icon name="shield" size={18}/>
                                <strong>Entity Framework</strong>
                                <p>ORM que converte objetos C# em queries SQL automaticamente.</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Padrões de projeto ── */}
                    <section className="about-section">
                        <h2>Padrões de Projeto Aplicados</h2>
                        <div className="patterns-list">
                            <PatternItem
                                icon="shield"
                                name="Repository Pattern"
                                description="Separa a lógica de acesso ao banco de dados da lógica de negócio. Cada entidade tem sua própria interface (IUserRepository) e implementação (UserRepository)."
                            />
                            <PatternItem
                                icon="settings"
                                name="Dependency Injection"
                                description="O ASP.NET Core injeta automaticamente as dependências nos controllers. Ex: o UsersController recebe IUserRepository sem precisar instanciá-lo."
                            />
                            <PatternItem
                                icon="check-circle"
                                name="Clean Code"
                                description="Nomes descritivos, funções pequenas com responsabilidade única, comentários explicativos e sem duplicação de código (DRY)."
                            />
                            <PatternItem
                                icon="trending-up"
                                name="REST"
                                description="API segue os padrões REST: verbos HTTP corretos (GET, POST, PUT, DELETE), recursos nomeados no plural e códigos de status apropriados."
                            />
                        </div>
                    </section>

                    {/* ── CTA ── */}
                    <section className="about-cta">
                        <h2>Pronto para explorar?</h2>
                        <p>Veja os eventos disponíveis ou acesse o painel para criar o seu.</p>
                        <div className="cta-buttons">
                            <Link to="/" className="btn btn-primary btn-lg">
                                <Icon name="home" size={18}/>
                                Ver Eventos
                            </Link>
                            <Link to="/organizar" className="btn btn-secondary btn-lg">
                                <Icon name="shield" size={18}/>
                                Organizar Evento
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function TechCard({ icon, title, description }) {
    return (
        <div className="tech-card">
            <div className="tech-card-icon">
                <Icon name={icon} size={20}/>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

function PatternItem({ icon, name, description }) {
    return (
        <div className="pattern-item">
            <div className="pattern-icon">
                <Icon name={icon} size={18}/>
            </div>
            <div>
                <strong>{name}</strong>
                <p>{description}</p>
            </div>
        </div>
    );
}