using Microsoft.EntityFrameworkCore;
using IngressosAPI.Data;
using IngressosAPI.Models;

namespace IngressosAPI.Repositories
{
    // Repositório = responsável por todas as operações no banco relacionadas a Evento
    // O Controller chama o Repositório; o Repositório fala com o banco.
    public class EventoRepository
    {
        private readonly AppDbContext _db;

        public EventoRepository(AppDbContext db)
        {
            _db = db;
        }

        // Busca todos os eventos (traz os ingressos junto com JOIN automático)
        public async Task<List<Evento>> ListarTodos()
        {
            return await _db.Eventos
                            .Include(e => e.Ingressos)
                            .ToListAsync();
        }

        // Busca um evento pelo ID; retorna null se não existir
        public async Task<Evento?> BuscarPorId(int id)
        {
            return await _db.Eventos
                            .Include(e => e.Ingressos)
                            .FirstOrDefaultAsync(e => e.Id == id);
        }

        // Salva um novo evento no banco
        public async Task<Evento> Criar(Evento evento)
        {
            _db.Eventos.Add(evento);
            await _db.SaveChangesAsync();
            return evento;
        }

        // Atualiza um evento existente e salva no banco
        public async Task<Evento?> Atualizar(int id, Evento dadosNovos)
        {
            var evento = await _db.Eventos.FindAsync(id);
            if (evento == null) return null;

            evento.Nome            = dadosNovos.Nome;
            evento.Local           = dadosNovos.Local;
            evento.Data            = dadosNovos.Data;
            evento.PrecoBase       = dadosNovos.PrecoBase;
            evento.CapacidadeTotal = dadosNovos.CapacidadeTotal;
            evento.IdadeMinima     = dadosNovos.IdadeMinima;

            await _db.SaveChangesAsync();
            return evento;
        }

        // Remove um evento do banco
        public async Task<bool> Deletar(int id)
        {
            var evento = await _db.Eventos.FindAsync(id);
            if (evento == null) return false;

            _db.Eventos.Remove(evento);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
