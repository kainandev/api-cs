using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Repositories;

namespace Api.Controllers {
    [ApiController]
    [Route("api/event-tickets")]
    public class EventTicketsController : ControllerBase {
        private readonly IEventTicketRepository _repository;
        private readonly IEventRepository _eventRepository;

        public EventTicketsController(IEventTicketRepository repository, IEventRepository eventRepository) {
            _repository = repository;
            _eventRepository = eventRepository;
        }

        // GET /api/event-tickets
        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var eventTickets = await _repository.GetAll();
            return Ok(eventTickets);
        }

        // GET /api/event-tickets/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) {
            var eventTicket = await _repository.GetById(id);

            if (eventTicket == null) {
                return NotFound("Lote de ingressos não encontrado.");
            }

            return Ok(eventTicket);
        }

        // GET /api/event-tickets/event/{eventId}  →  todos os lotes de um evento
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetByEventId(int eventId) {
            var ev = await _eventRepository.GetById(eventId);

            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            var eventTickets = await _repository.GetByEventId(eventId);

            return Ok(eventTickets);
        }

        // POST /api/event-tickets  →  organizador cria um novo lote de ingressos para o evento
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EventTicket eventTicket) {
            var ev = await _eventRepository.GetById(eventTicket.EventId);

            // Regra: o evento precisa existir
            if (ev == null) {
                return NotFound("Evento não encontrado.");
            }

            // Regra: não pode criar lote para evento cancelado ou encerrado
            if (ev.Status != EventStatus.Active) {
                return BadRequest("Não é possível criar lotes para um evento inativo.");
            }

            // Regra: preço não pode ser negativo
            if (eventTicket.Price < 0) {
                return BadRequest("O preço do ingresso não pode ser negativo.");
            }

            // Regra: quantidade deve ser maior que zero
            if (eventTicket.TotalAmount <= 0) {
                return BadRequest("A quantidade de ingressos deve ser maior que zero.");
            }

            // Regra: período de vendas deve ser válido
            if (eventTicket.SalesStart >= eventTicket.SalesEnd) {
                return BadRequest("A data de início das vendas deve ser anterior à data de encerramento.");
            }

            var created = await _repository.Create(eventTicket);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT /api/event-tickets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EventTicket updatedData) {
            var existing = await _repository.GetById(id);

            if (existing == null) {
                return NotFound("Lote de ingressos não encontrado.");
            }

            // Regra: não pode reduzir capacidade abaixo do total já vendido
            if (updatedData.TotalAmount < existing.SoldAmount) {
                return BadRequest($"A capacidade não pode ser menor que os ingressos já vendidos ({existing.SoldAmount}).");
            }

            // Regra: preço não pode ser negativo
            if (updatedData.Price < 0) {
                return BadRequest("O preço do ingresso não pode ser negativo.");
            }

            var updated = await _repository.Update(id, updatedData);

            return Ok(updated);
        }

        // DELETE /api/event-tickets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) {
            var eventTicket = await _repository.GetById(id);

            if (eventTicket == null) {
                return NotFound("Lote de ingressos não encontrado.");
            }

            // Regra: não pode excluir lote que já possui ingressos vendidos
            if (eventTicket.SoldAmount > 0) {
                return BadRequest("Não é possível excluir um lote que já possui ingressos vendidos.");
            }

            await _repository.Delete(id);

            return NoContent();
        }
    }
}