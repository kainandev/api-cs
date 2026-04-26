using Microsoft.AspNetCore.Mvc;
using ApiCs.Data;
using ApiCs.Models;
using ApiCs.Repositories;

namespace IngressosAPI.Controllers {
    
    [ApiController]
    [Route("api/ingressos")]
    public class IngressosController : ControllerBase {

        // Injetando o repositório e o contexto do banco de dados
        private readonly IngressoRepository _repo;
        
        // Injetando o contexto do banco de dados para poder atualizar o contador de vendidos no evento
        private readonly AppDbContext _db;

        // Construtor da classe para injeção de dependências
        public IngressosController(IngressoRepository repo, AppDbContext db) {
            _repo = repo;
            _db   = db;
        }

        // GET /api/ingressos
        [HttpGet]
        public async Task<ActionResult<List<Ingresso>>> ListarTodos() {
            
            // Regra: retorna a lista de todos os ingressos cadastrados no sistema
            var ingressos = await _repo.ListarTodos();
            
            // Regra: se não houver ingressos cadastrados, retorna lista vazia (200 OK)
            return Ok(ingressos);
        }

        // GET /api/ingressos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ingresso>> BuscarPorId(int id) {
            // Regra: se o ingresso não existir, retorna 404
            var ingresso = await _repo.BuscarPorId(id);

            // Regra: se o ingresso existir, retorna os dados do ingresso (200 OK)
            if (ingresso == null) {
                return NotFound("Ingresso não encontrado.");
                
            }

            // Regra: se o ingresso existir, retorna os dados do ingresso (200 OK)
            return Ok(ingresso);
        }

        // GET /api/ingressos/evento/3  →  todos os ingressos de um evento
        [HttpGet("evento/{eventoId}")]
        public async Task<ActionResult<List<Ingresso>>> ListarPorEvento(int eventoId) {
            
            // Verifica se o evento existe
            var ingressos = await _repo.ListarPorEvento(eventoId);
            
            // Regra: se o evento não existir, retorna 404
            if (ingressos == null || ingressos.Count == 0) {
                return NotFound("Evento não encontrado ou sem ingressos.");
            }

            // Regra: se o evento existir mas não tiver ingressos, retorna lista vazia (200 OK)
            return Ok(ingressos);
        }

        // POST /api/ingressos  →  comprar um ingresso
        [HttpPost]
        public async Task<ActionResult<Ingresso>> Comprar([FromBody] Ingresso ingresso) {
            // Busca o evento no banco
            var evento = await _db.Eventos.FindAsync(ingresso.EventoId);
            
            // + ------------------------------------------- +
            // Regras de negócio para compra de ingresso:
            // + ------------------------------------------- +

            // Verifica se o evento existe
            if (evento == null) {
                return NotFound("Evento não encontrado.");
                
            }

            // Verifica se o evento já ocorreu
            if (evento.Data < DateTime.Now) {
                return BadRequest("Esse evento já ocorreu.");
                
            }

            // Verifica se o evento já está esgotado
            if (evento.IngressosVendidos >= evento.CapacidadeTotal) {
                return BadRequest("Evento esgotado.");
                
            }
            
            // Verifica a idade mínima para o evento
            if (ingresso.Idade < evento.IdadeMinima) {
                return BadRequest($"Idade mínima para esse evento é {evento.IdadeMinima} anos.");
                
            }

            // Calcula o preço de acordo com o tipo do ingresso
            ingresso.PrecoFinal = ingresso.Tipo switch {
                TipoIngresso.Normal => evento.PrecoBase,
                TipoIngresso.Meia => evento.PrecoBase * 0.5m,
                TipoIngresso.VIP => evento.PrecoBase * 1.5m,
                _ => evento.PrecoBase
            };

            // Busca a data atual para registrar a data da compra
            ingresso.DataCompra = DateTime.Now;

            // Salva o ingresso no banco
            var criado = await _repo.Criar(ingresso);

            // Atualiza o contador de vendidos no evento
            evento.IngressosVendidos++;
            await _db.SaveChangesAsync();

            // Retorna o ingresso criado
            return Ok(criado);
        }

        // DELETE /api/ingressos/5  →  cancelar um ingresso
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancelar(int id) {
            
            // Busca o ingresso no banco
            var ingresso = await _repo.BuscarPorId(id);

            // + ------------------------------------------- +
            // Regras de negócio para cancelamento de ingresso:
            // + ------------------------------------------- +

            // Verifica se o ingresso existe
            if (ingresso == null) {
                return NotFound("Ingresso não encontrado.");
                
            }

            // Verifica se o evento já ocorreu (não pode cancelar ingresso de evento já realizado)
            if (ingresso.Evento != null && ingresso.Evento.Data < DateTime.Now) {
                return BadRequest("Não é possível cancelar ingresso de evento já realizado.");
                
            }

            // Abre uma vaga no evento
            var evento = await _db.Eventos.FindAsync(ingresso.EventoId);
            if (evento != null) {
                evento.IngressosVendidos--;
                await _db.SaveChangesAsync();
            }

            // Remove o ingresso do banco
            await _repo.Deletar(id);

            // Retorna sucesso
            return Ok("Ingresso cancelado com sucesso.");
        }
    }
}
