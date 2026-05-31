using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Repositories;

namespace Api.Controllers {
    [ApiController]
    [Route("api/events")]
    public class EventsController : ControllerBase {
        private readonly IEventRepository _eventRepository;
        private readonly ITicketRepository _ticketRepository;

        public EventsController(IEventRepository eventRepository, ITicketRepository ticketRepository) {
            _eventRepository = eventRepository;
            _ticketRepository = ticketRepository;
        }

        // GET /api/events
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var events = await _eventRepository.GetAll();
            return Ok(events);
        }

        // GET /api/events/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) {
            var ev = await _eventRepository.GetById(id);

            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            return Ok(ev);
        }

        // POST /api/events
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Event ev) {
            if (string.IsNullOrWhiteSpace(ev.Name)) {
                return BadRequest("O nome do evento é obrigatório.");
            }

            // Regra: não pode criar evento com data no passado
            if (ev.Date < DateTime.UtcNow) {
                return BadRequest("A data do evento não pode ser no passado.");
            }

            var created = await _eventRepository.Create(ev);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT /api/events/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Event updatedData) {
            var existing = await _eventRepository.GetById(id);

            if (existing == null) {
                return NotFound("Evento não encontrado.");
            }

            // Regra: não pode alterar data de evento para o passado
            if (updatedData.Date < DateTime.UtcNow) {
                return BadRequest("A nova data do evento não pode ser no passado.");
            }

            var updated = await _eventRepository.Update(id, updatedData);

            return Ok(updated);
        }

        // DELETE /api/events/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) {
            var ev = await _eventRepository.GetById(id);

            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            // Regra: não pode excluir evento que já possui ingressos vendidos em qualquer lote
            bool hasTicketsSold = ev.EventTickets.Any(et => et.SoldAmount > 0);

            if (hasTicketsSold) {
                return BadRequest("Não é possível excluir um evento que possui ingressos vendidos.");
            }

            await _eventRepository.Delete(id);

            return NoContent();
        }

        // GET /api/events/{id}/summary  →  resumo financeiro do evento
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetSummary(int id) {
            var ev = await _eventRepository.GetById(id);

            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            var tickets = (await _ticketRepository.GetByEventId(id)).ToList();

            decimal totalRevenue = tickets.Sum(t => t.PriceFinal);
            int totalSold = tickets.Count;
            decimal averagePrice = totalSold > 0 ? Math.Round(totalRevenue / totalSold, 2) : 0;
            int totalCapacity = ev.EventTickets.Sum(et => et.TotalAmount);

            return Ok(new {
                EventName = ev.Name,
                EventDate = ev.Date,
                TotalCapacity = totalCapacity,
                TotalSold = totalSold,
                RemainingSpots = totalCapacity - totalSold,
                TotalRevenue = totalRevenue,
                AverageTicketPrice = averagePrice,
                Batches = ev.EventTickets.Select(et => new {
                    BatchName = et.Name,
                    Type = et.Type.ToString(),
                    Price = et.Price,
                    Sold = et.SoldAmount,
                    Available = et.AvailableAmount,
                    IsActive = et.IsActive
                })
            });
        }

        // GET /api/events/{id}/attendees  →  lista de participantes para controle de entrada
        [HttpGet("{id}/attendees")]
        public async Task<IActionResult> GetAttendees(int id) {
            var ev = await _eventRepository.GetById(id);

            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            var tickets = await _ticketRepository.GetByEventId(id);

            var attendees = tickets.Select(t => new {
                TicketId = t.Id,
                UserId = t.UserId,
                BatchName = t.EventTicket?.Name,
                TicketType = t.EventTicket?.Type.ToString(),
                PricePaid = t.PriceFinal,
                PurchasedAt = t.PurchasedAt,
                CheckedIn = t.IsUsed,
                CheckedInAt = t.UsedAt
            });

            return Ok(attendees);
        }
    }
}