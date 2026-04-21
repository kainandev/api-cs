using Microsoft.AspNetCore.Mvc;
using IngressosAPI.Models;
using IngressosAPI.Repositories;

namespace IngressosAPI.Controllers
{
    [ApiController]
    [Route("api/eventos")]
    public class EventosController : ControllerBase
    {
        private readonly EventoRepository _repo;

        public EventosController(EventoRepository repo)
        {
            _repo = repo;
        }

        // GET /api/eventos
        [HttpGet]
        public async Task<ActionResult<List<Evento>>> ListarTodos()
        {
            var eventos = await _repo.ListarTodos();
            return Ok(eventos);
        }

        // GET /api/eventos/3
        [HttpGet("{id}")]
        public async Task<ActionResult<Evento>> BuscarPorId(int id)
        {
            var evento = await _repo.BuscarPorId(id);

            if (evento == null)
                return NotFound("Evento não encontrado.");

            return Ok(evento);
        }

        // POST /api/eventos
        [HttpPost]
        public async Task<ActionResult<Evento>> Criar([FromBody] Evento evento)
        {
            // Regra: não pode criar evento com data no passado
            if (evento.Data < DateTime.Now)
                return BadRequest("A data do evento não pode ser no passado.");

            var criado = await _repo.Criar(evento);
            return Ok(criado);
        }

        // PUT /api/eventos/3
        [HttpPut("{id}")]
        public async Task<ActionResult<Evento>> Atualizar(int id, [FromBody] Evento dadosNovos)
        {
            // Regra: não pode reduzir capacidade abaixo de ingressos já vendidos
            var existente = await _repo.BuscarPorId(id);
            if (existente == null)
                return NotFound("Evento não encontrado.");

            if (dadosNovos.CapacidadeTotal < existente.IngressosVendidos)
                return BadRequest($"Capacidade não pode ser menor que os ingressos já vendidos ({existente.IngressosVendidos}).");

            var atualizado = await _repo.Atualizar(id, dadosNovos);
            return Ok(atualizado);
        }

        // DELETE /api/eventos/3
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(int id)
        {
            var evento = await _repo.BuscarPorId(id);
            if (evento == null)
                return NotFound("Evento não encontrado.");

            // Regra: não pode deletar evento com ingressos vendidos
            if (evento.IngressosVendidos > 0)
                return BadRequest("Não é possível excluir um evento que já tem ingressos vendidos.");

            await _repo.Deletar(id);
            return Ok("Evento removido com sucesso.");
        }

        // GET /api/eventos/3/resumo  →  relatório financeiro do evento
        [HttpGet("{id}/resumo")]
        public async Task<ActionResult> Resumo(int id)
        {
            var evento = await _repo.BuscarPorId(id);
            if (evento == null)
                return NotFound("Evento não encontrado.");

            decimal totalArrecadado = evento.Ingressos.Sum(i => i.PrecoFinal);
            decimal ticketMedio     = evento.Ingressos.Count > 0
                                        ? totalArrecadado / evento.Ingressos.Count
                                        : 0;

            return Ok(new
            {
                Evento            = evento.Nome,
                IngressosVendidos = evento.IngressosVendidos,
                VagasRestantes    = evento.VagasRestantes,
                TotalArrecadado   = totalArrecadado,
                TicketMedio       = Math.Round(ticketMedio, 2),
                QtdNormal         = evento.Ingressos.Count(i => i.Tipo == TipoIngresso.Normal),
                QtdMeia           = evento.Ingressos.Count(i => i.Tipo == TipoIngresso.Meia),
                QtdVIP            = evento.Ingressos.Count(i => i.Tipo == TipoIngresso.VIP)
            });
        }
    }
}
