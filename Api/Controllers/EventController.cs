using Microsoft.AspNetCore.Mvc;
using ApiCs.Models;
using ApiCs.Repositories;

namespace TicketsAPI.Controllers {
    [ApiController]
    [Route("api/Events")]
    
    public class EventsController : ControllerBase {
        // Injetando o repositório de Events para acessar os dados
        private readonly EventRepository _repo;

        // Construtor da classe para injeção de dependências
        public EventsController(EventRepository repo) {
            _repo = repo;
        }

        // GET /api/Events
        [HttpGet]
        public async Task<ActionResult<List<Event>>> ListarTodos() {
            // Regra: retorna a lista de todos os Events cadastrados no sistema
            var Events = await _repo.ListarTodos();
            
            // Regra: se não houver Events cadastrados, retorna lista vazia (200 OK)
            return Ok(Events);
        }

        // GET /api/Events/3
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> BuscarPorId(int id) {
            // Regra: se o Event não existir, retorna 404
            var Event = await _repo.BuscarPorId(id);

            // Regra: se o Event existir, retorna os dados do Event (200 OK)
            if (Event == null) {
                return NotFound("Event não encontrado.");
                
            }

            return Ok(Event);
        }

        // POST /api/Events
        [HttpPost]
        public async Task<ActionResult<Event>> Criar([FromBody] Event Event) {
            // Regra: não pode criar Event com data no passado
            if (Event.Date < DateTime.Now) {
                return BadRequest("A data do Event não pode ser no passado.");
                
            }

            // Regra: não pode criar Event com preço base negativo
            var criado = await _repo.Criar(Event);
            
            return Ok(criado);
        }

        // PUT /api/Events/3
        [HttpPut("{id}")]
        public async Task<ActionResult<Event>> Atualizar(int id, [FromBody] Event dadosNovos) {
            // Regra: não pode reduzir capacidade abaixo de Tickets já vendidos
            var existente = await _repo.BuscarPorId(id);
            
            // Regra: se o Event não existir, retorna 404
            if (existente == null) {
                return NotFound("Event não encontrado.");

            }

            // Regra: não pode atualizar Event para data no passado
            if (dadosNovos.Date < DateTime.Now) {
                return BadRequest("O Event já foi finalizado.");
            }

            if (dadosNovos.Amount < existente.TicketsSells) {
                return BadRequest(
                    $"Capacidade não pode ser menor que os Tickets já vendidos ({existente.TicketsSells})."
                );
                
            }

            // Regra: atualiza os dados do Event e retorna os dados atualizados (200 OK)
            var atualizado = await _repo.Atualizar(id, dadosNovos);
            
            return Ok(atualizado);
        }

        // DELETE /api/Events/3
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(int id) {
            
            // Regra: se o Event não existir, retorna 404
            var Event = await _repo.BuscarPorId(id);
            
            // Regra: se o Event não existir, retorna 404
            if (Event == null) {
                return NotFound("Event não encontrado.");
                
            }

            // Regra: não pode deletar Event com Tickets vendidos
            if (Event.TicketsSells > 0) {
                return BadRequest("Não é possível excluir um Event que já tem Tickets vendidos.");
                
            }

            // Regra: deleta o Event e retorna mensagem de sucesso (200 OK)
            await _repo.Deletar(id);

            return Ok("Event removido com sucesso.");
        }

        // GET /api/Events/3/resumo  →  relatório financeiro do Event
        [HttpGet("{id}/resumo")]
        public async Task<ActionResult> Resumo(int id) {
            // Regra: se o Event não existir, retorna 404
            var Event = await _repo.BuscarPorId(id);
            
            // Regra: se o Event não existir, retorna 404
            if (Event == null) {
                return NotFound("Event não encontrado.");
                
            }
            // Regra: se o Event existir, retorna um resumo financeiro do Event (200 OK)
            decimal totalArrecadado = Event.Ticket.Sum(i => i.PriceFinal);

            // Cálculo do ticket médio (total arrecadado dividido pela quantidade de Tickets vendidos)
            decimal ticketMedio = Event.Ticket.Count > 0 ? totalArrecadado / Event.Ticket.Count : 0;

            // Regra: retorna um resumo financeiro do Event (200 OK)
            return Ok(new {
                Event = Event.Name,
                TicketsVendidos = Event.TicketsSells,
                VagasRestantes = Event.RestAmount,
                TotalArrecadado = totalArrecadado,
                TicketMedio = Math.Round(ticketMedio, 2),
                QtdNormal = Event.Ticket.Count(i => i.typeTicket == TypeTicket.Normal),
                QtdMeia = Event.Ticket.Count(i => i.typeTicket == TypeTicket.Middle),
                QtdVIP = Event.Ticket.Count(i => i.typeTicket == TypeTicket.VIP)
            });
        }
    }
}
