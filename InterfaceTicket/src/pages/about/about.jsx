import React from 'react';
import Header from '../../assets/components/Header/header.jsx';

function about() {
  return (
    <>
      <Header />
      <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left', lineHeight: '1.6' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>Sobre Nós</h1>
        <p style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '20px' }}>
          O <strong>Event Ticket</strong> é uma plataforma moderna para gerenciamento, venda e validação de ingressos de eventos.
        </p>
        <p style={{ fontSize: '16px', color: 'var(--text)' }}>
          Desenvolvido com tecnologias de ponta como React no Frontend e ASP.NET Core no Backend, nosso foco é entregar uma experiência ágil para organizadores de eventos e clientes finais.
        </p>
      </div>
    </>
  );
}
export default about;