using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Repositories;

namespace Api.Controllers {
    [ApiController]
    [Route("api/tickets")]
    public class TicketsController : ControllerBase {
        private readonly ITicketRepository _ticketRepository;
        private readonly IEventTicketRepository _eventTicketRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEventRepository _eventRepository;

        public TicketsController(
            ITicketRepository ticketRepository,
            IEventTicketRepository eventTicketRepository,
            IUserRepository userRepository,
            IEventRepository eventRepository) {
            _ticketRepository = ticketRepository;
            _eventTicketRepository = eventTicketRepository;
            _userRepository = userRepository;
            _eventRepository = eventRepository;
        }

        // GET /api/tickets
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var tickets = await _ticketRepository.GetAll();
            return Ok(tickets);
        }

        // GET /api/tickets/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id) {
            var ticket = await _ticketRepository.GetById(id);

            if (ticket == null) {
                return NotFound("Ingresso não encontrado.");
            }

            return Ok(ticket);
        }

        // GET /api/tickets/user/{userId}  →  todos os ingressos de um usuário
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(string userId) {
            var user = await _userRepository.GetById(userId);

            if (user == null) {
                return NotFound("Usuário não encontrado.");
            }

            var tickets = await _ticketRepository.GetByUserId(userId);

            return Ok(tickets);
        }

        // POST /api/tickets  →  compra de um ingresso
        [HttpPost]
        public async Task<IActionResult> Purchase([FromBody] Ticket ticket) {
            var user = await _userRepository.GetById(ticket.UserId);

            if (user == null) {
                return NotFound("Usuário não encontrado.");
            }

            var eventTicket = await _eventTicketRepository.GetById(ticket.EventTicketId);

            if (eventTicket == null) {
                return NotFound("Lote de ingressos não encontrado.");
            }

            var ev = await _eventRepository.GetById(eventTicket.EventId);

            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            // Regra: não pode comprar ingresso para evento que já ocorreu
            if (ev.Date < DateTime.UtcNow) {
                return BadRequest("Este evento já ocorreu.");
            }

            // Regra: não pode comprar ingresso para evento cancelado
            if (ev.Status == EventStatus.Cancelled) {
                return BadRequest("Este evento foi cancelado.");
            }

            // Regra: o lote precisa estar ativo
            if (!eventTicket.IsActive) {
                return BadRequest("Este lote de ingressos não está disponível para venda.");
            }

            DateTime now = DateTime.UtcNow;

            // Regra: as vendas do lote ainda não iniciaram
            if (now < eventTicket.SalesStart) {
                return BadRequest("As vendas para este lote ainda não iniciaram.");
            }

            // Regra: o período de vendas do lote encerrou
            if (now > eventTicket.SalesEnd) {
                return BadRequest("O período de vendas para este lote encerrou.");
            }

            // Regra: lote esgotado
            if (eventTicket.SoldAmount >= eventTicket.TotalAmount) {
                return BadRequest("Este lote de ingressos está esgotado.");
            }

            // Regra: usuário deve ter a idade mínima exigida pelo evento
            int userAge = DateTime.UtcNow.Year - user.DateOfBirth.Year;

            if (user.DateOfBirth.Date > DateTime.UtcNow.AddYears(-userAge)) {
                userAge--;
            }

            if (userAge < ev.MinAge) {
                return BadRequest($"A idade mínima para este evento é {ev.MinAge} anos.");
            }

            // Calcula o preço final com base no tipo de ingresso definido no lote
            ticket.PriceFinal = eventTicket.Type switch {
                TicketType.Normal    => eventTicket.Price,
                TicketType.HalfPrice => eventTicket.Price * 0.5m,
                TicketType.VIP       => eventTicket.Price * 1.5m,
                _                    => eventTicket.Price
            };

            var created = await _ticketRepository.Create(ticket);

            // Atualiza o contador de vendas do lote
            await _eventTicketRepository.IncrementSold(eventTicket.Id);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // DELETE /api/tickets/{id}  →  cancelamento de ingresso
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(string id) {
            var ticket = await _ticketRepository.GetById(id);

            if (ticket == null) {
                return NotFound("Ingresso não encontrado.");
            }

            // Regra: não pode cancelar ingresso já utilizado no evento
            if (ticket.IsUsed) {
                return BadRequest("Não é possível cancelar um ingresso que já foi utilizado.");
            }

            // Regra: não pode cancelar ingresso de evento que já ocorreu
            if (ticket.EventTicket != null) {
                var ev = await _eventRepository.GetById(ticket.EventTicket.EventId);

                if (ev != null && ev.Date < DateTime.UtcNow) {
                    return BadRequest("Não é possível cancelar o ingresso de um evento que já ocorreu.");
                }
            }

            await _eventTicketRepository.DecrementSold(ticket.EventTicketId);
            await _ticketRepository.Delete(id);

            return NoContent();
        }

        // POST /api/tickets/{id}/checkin  →  validação do ingresso na entrada do evento
        [HttpPost("{id}/checkin")]
        public async Task<IActionResult> CheckIn(string id) {
            var ticket = await _ticketRepository.GetById(id);

            if (ticket == null) {
                return NotFound("Ingresso não encontrado.");
            }

            // Regra: ingresso já utilizado não pode ser validado novamente
            if (ticket.IsUsed) {
                return BadRequest("Este ingresso já foi utilizado.");
            }

            await _ticketRepository.CheckIn(id);

            return Ok("Check-in realizado com sucesso.");
        }
    }
}