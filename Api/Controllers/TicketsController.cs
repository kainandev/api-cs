using Microsoft.AspNetCore.Mvc;
using ApiCs.Data;
using ApiCs.Models;
using ApiCs.Repositories;

namespace TicketsAPI.Controllers {
    
    [ApiController]
    [Route("api/Tickets")]
    public class TicketsController : ControllerBase {

        // Injetando o repositório e o contexto do banco de dados
        private readonly TicketRepository _repo;
        
        // Injetando o contexto do banco de dados para poder atualizar o contador de vendidos no Event
        private readonly AppDbContext _db;

        // Construtor da classe para injeção de dependências
        public TicketsController(TicketRepository repo, AppDbContext db) {
            _repo = repo;
            _db   = db;
        }

        // GET /api/Tickets
        [HttpGet]
        public async Task<ActionResult<List<Ticket>>> ListarTodos() {
            
            // Regra: retorna a lista de todos os Tickets cadastrados no sistema
            var Tickets = await _repo.ListarTodos();
            
            // Regra: se não houver Tickets cadastrados, retorna lista vazia (200 OK)
            return Ok(Tickets);
        }

        // GET /api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> BuscarPorId(int id) {
            // Regra: se o Ticket não existir, retorna 404
            var Ticket = await _repo.BuscarPorId(id);

            // Regra: se o Ticket existir, retorna os dados do Ticket (200 OK)
            if (Ticket == null) {
                return NotFound("Ticket não encontrado.");
                
            }

            // Regra: se o Ticket existir, retorna os dados do Ticket (200 OK)
            return Ok(Ticket);
        }

        // GET /api/Tickets/Event/3  →  todos os Tickets de um Event
        [HttpGet("Event/{EventId}")]
        public async Task<ActionResult<List<Ticket>>> ListarPorEvent(int EventId) {
            
            // Verifica se o Event existe
            var Tickets = await _repo.ListarPorEvent(EventId);
            
            // Regra: se o Event não existir, retorna 404
            if (Tickets == null || Tickets.Count == 0) {
                return NotFound("Event não encontrado ou sem Tickets.");
            }

            // Regra: se o Event existir mas não tiver Tickets, retorna lista vazia (200 OK)
            return Ok(Tickets);
        }

        // POST /api/Tickets  →  comprar um Ticket
        [HttpPost]
        public async Task<ActionResult<Ticket>> Comprar([FromBody] Ticket Ticket) {
            // Busca o Event no banco
            var Event = await _db.Events.FindAsync(Ticket.EventId);
            
            // + ------------------------------------------- +
            // Regras de negócio para compra de Ticket:
            // + ------------------------------------------- +

            // Verifica se o Event existe
            if (Event == null) {
                return NotFound("Event não encontrado.");
                
            }

            // Verifica se o Event já ocorreu
            if (Event.Date < DateTime.Now) {
                return BadRequest("Esse Event já ocorreu.");
                
            }

            // Verifica se o Event já está esgotado
            if (Event.TicketsSells >= Event.Amount) {
                return BadRequest("Event esgotado.");
                
            }
            
            // Verifica a idade mínima para o Event
            if (Ticket.Age < Event.MinAge) {
                return BadRequest($"Idade mínima para esse Event é {Event.MinAge} anos.");
                
            }

            // Calcula o preço de acordo com o tipo do Ticket
            Ticket.PriceFinal = Ticket.typeTicket switch {
                TypeTicket.Normal => Event.PriceBase,
                TypeTicket.Middle => Event.PriceBase * 0.5m,
                TypeTicket.VIP => Event.PriceBase * 1.5m,
                _ => Event.PriceBase
            };

            // Busca a data atual para registrar a data da compra
            Ticket.DateBuy = DateTime.Now;

            // Salva o Ticket no banco
            var criado = await _repo.Criar(Ticket);

            // Atualiza o contador de vendidos no Event
            Event.TicketsSells++;
            await _db.SaveChangesAsync();

            // Retorna o Ticket criado
            return Ok(criado);
        }

        // DELETE /api/Tickets/5  →  cancelar um Ticket
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancelar(int id) {
            
            // Busca o Ticket no banco
            var Ticket = await _repo.BuscarPorId(id);

            // + ------------------------------------------- +
            // Regras de negócio para cancelamento de Ticket:
            // + ------------------------------------------- +

            // Verifica se o Ticket existe
            if (Ticket == null) {
                return NotFound("Ticket não encontrado.");
                
            }

            // Verifica se o Event já ocorreu (não pode cancelar Ticket de Event já realizado)
            if (Ticket.Event != null && Ticket.Event.Date < DateTime.Now) {
                return BadRequest("Não é possível cancelar Ticket de Event já realizado.");
                
            }

            // Abre uma vaga no Event
            var Event = await _db.Events.FindAsync(Ticket.EventId);
            if (Event != null) {
                Event.TicketsSells--;
                await _db.SaveChangesAsync();
            }

            // Remove o Ticket do banco
            await _repo.Deletar(id);

            // Retorna sucesso
            return Ok("Ticket cancelado com sucesso.");
        }
    }
}
