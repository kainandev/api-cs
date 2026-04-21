using Microsoft.AspNetCore.Mvc;
using IngressosAPI.Data;
using IngressosAPI.Models;
using IngressosAPI.Repositories;

namespace IngressosAPI.Controllers
{
    [ApiController]
    [Route("api/ingressos")]
    public class IngressosController : ControllerBase
    {
        private readonly IngressoRepository _repo;
        private readonly AppDbContext _db;

        public IngressosController(IngressoRepository repo, AppDbContext db)
        {
            _repo = repo;
            _db   = db;
        }

        // GET /api/ingressos
        [HttpGet]
        public async Task<ActionResult<List<Ingresso>>> ListarTodos()
        {
            var ingressos = await _repo.ListarTodos();
            return Ok(ingressos);
        }

        // GET /api/ingressos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ingresso>> BuscarPorId(int id)
        {
            var ingresso = await _repo.BuscarPorId(id);

            if (ingresso == null)
                return NotFound("Ingresso não encontrado.");

            return Ok(ingresso);
        }

        // GET /api/ingressos/evento/3  →  todos os ingressos de um evento
        [HttpGet("evento/{eventoId}")]
        public async Task<ActionResult<List<Ingresso>>> ListarPorEvento(int eventoId)
        {
            var ingressos = await _repo.ListarPorEvento(eventoId);
            return Ok(ingressos);
        }

        // POST /api/ingressos  →  comprar um ingresso
        [HttpPost]
        public async Task<ActionResult<Ingresso>> Comprar([FromBody] Ingresso ingresso)
        {
            // Busca o evento no banco
            var evento = await _db.Eventos.FindAsync(ingresso.EventoId);

            if (evento == null)
                return NotFound("Evento não encontrado.");

            if (evento.Data < DateTime.Now)
                return BadRequest("Esse evento já ocorreu.");

            if (evento.IngressosVendidos >= evento.CapacidadeTotal)
                return BadRequest("Evento esgotado.");

            if (ingresso.Idade < evento.IdadeMinima)
                return BadRequest($"Idade mínima para esse evento é {evento.IdadeMinima} anos.");

            // Calcula o preço de acordo com o tipo do ingresso
            ingresso.PrecoFinal = ingresso.Tipo switch
            {
                TipoIngresso.Normal => evento.PrecoBase,
                TipoIngresso.Meia   => evento.PrecoBase * 0.5m,
                TipoIngresso.VIP    => evento.PrecoBase * 1.5m,
                _                   => evento.PrecoBase
            };

            ingresso.DataCompra = DateTime.Now;

            var criado = await _repo.Criar(ingresso);

            // Atualiza o contador de vendidos no evento
            evento.IngressosVendidos++;
            await _db.SaveChangesAsync();

            return Ok(criado);
        }

        // DELETE /api/ingressos/5  →  cancelar um ingresso
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancelar(int id)
        {
            var ingresso = await _repo.BuscarPorId(id);
            if (ingresso == null)
                return NotFound("Ingresso não encontrado.");

            if (ingresso.Evento != null && ingresso.Evento.Data < DateTime.Now)
                return BadRequest("Não é possível cancelar ingresso de evento já realizado.");

            // Abre uma vaga no evento
            var evento = await _db.Eventos.FindAsync(ingresso.EventoId);
            if (evento != null)
            {
                evento.IngressosVendidos--;
                await _db.SaveChangesAsync();
            }

            await _repo.Deletar(id);
            return Ok("Ingresso cancelado com sucesso.");
        }
    }
}
