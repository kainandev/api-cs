# 🎟️ IngressosAPI

API REST para venda de ingressos de eventos, desenvolvida em ASP.NET Core com Entity Framework e SQLite.

## 📋 Descrição do Sistema

O sistema permite gerenciar **eventos** e a **venda de ingressos** para esses eventos. Há três tipos de ingresso com preços diferentes: Normal (preço cheio), Meia-entrada (50% de desconto) e VIP (50% mais caro). A API valida regras de negócio como lotação, idade mínima e status do evento.

## 🏗️ Estrutura do Projeto

```
IngressosAPI/
├── Controllers/         → Recebem as requisições HTTP
│   ├── EventosController.cs
│   └── IngressosController.cs
├── Models/              → Representam as entidades do banco
│   ├── Evento.cs
│   ├── Ingresso.cs
│   └── TipoIngresso.cs  (enum)
├── Data/
│   └── AppDbContext.cs  → Configuração do Entity Framework
├── Repositories/        → Acesso ao banco de dados
│   ├── IEventoRepository.cs
│   ├── EventoRepository.cs
│   ├── IIngressoRepository.cs
│   └── IngressoRepository.cs
└── Program.cs           → Configuração e inicialização
```

## 🚀 Como Executar

```bash
# Restaurar pacotes NuGet
dotnet restore

# Executar a API (o banco SQLite é criado automaticamente)
dotnet run

# Acessar o Swagger (interface de testes)
# http://localhost:5000/swagger
```

## 📡 Endpoints

### Eventos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/eventos` | Lista todos os eventos |
| GET | `/api/eventos/{id}` | Busca evento por ID |
| POST | `/api/eventos` | Cria um novo evento |
| PUT | `/api/eventos/{id}` | Atualiza um evento |
| DELETE | `/api/eventos/{id}` | Remove um evento |
| GET | `/api/eventos/{id}/resumo` | Resumo financeiro do evento |

### Ingressos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/ingressos` | Lista todos os ingressos |
| GET | `/api/ingressos/{id}` | Busca ingresso por ID |
| GET | `/api/ingressos/evento/{eventoId}` | Lista ingressos de um evento |
| POST | `/api/ingressos` | Compra um ingresso |
| DELETE | `/api/ingressos/{id}` | Cancela um ingresso |

## 📦 Exemplos de Requisições (Postman)

### Criar Evento
```json
POST /api/eventos
{
  "nome": "Show da Banda XYZ",
  "data": "2026-12-15T20:00:00",
  "local": "Arena Curitiba",
  "capacidadeTotal": 500,
  "precoBase": 80.00,
  "idadeMinima": 18
}
```

### Comprar Ingresso
```json
POST /api/ingressos
{
  "eventoId": 1,
  "nomeComprador": "João Silva",
  "cpf": "123.456.789-00",
  "idade": 25,
  "tipo": 0
}
```
> tipo: 0 = Normal | 1 = Meia | 2 = VIP

## ✅ Regras de Negócio

- Não é possível criar evento com data no passado
- Não é possível vender ingresso para evento lotado
- Não é possível vender ingresso para evento cancelado ou passado
- Idade mínima é validada na compra do ingresso
- A capacidade não pode ser reduzida abaixo dos ingressos já vendidos
- Não é possível excluir evento com ingressos vendidos
- Não é possível cancelar ingresso de evento já realizado

## 🛠️ Tecnologias

- ASP.NET Core 8.0
- Entity Framework Core 8.0
- SQLite
- Swagger (Swashbuckle)
