using Microsoft.EntityFrameworkCore;
using IngressosAPI.Data;
using IngressosAPI.Models;

namespace IngressosAPI.Repositories
{
    // Repositório responsável pelas operações de Ingresso no banco
    public class IngressoRepository
    {
        private readonly AppDbContext _db;

        public IngressoRepository(AppDbContext db)
        {
            _db = db;
        }

        // Lista todos os ingressos com os dados do evento junto
        public async Task<List<Ingresso>> ListarTodos()
        {
            return await _db.Ingressos
                            .Include(i => i.Evento)
                            .ToListAsync();
        }

        // Lista os ingressos de um evento específico
        public async Task<List<Ingresso>> ListarPorEvento(int eventoId)
        {
            return await _db.Ingressos
                            .Where(i => i.EventoId == eventoId)
                            .ToListAsync();
        }

        // Busca um ingresso pelo ID
        public async Task<Ingresso?> BuscarPorId(int id)
        {
            return await _db.Ingressos
                            .Include(i => i.Evento)
                            .FirstOrDefaultAsync(i => i.Id == id);
        }

        // Salva um ingresso no banco
        public async Task<Ingresso> Criar(Ingresso ingresso)
        {
            _db.Ingressos.Add(ingresso);
            await _db.SaveChangesAsync();
            return ingresso;
        }

        // Remove um ingresso do banco
        public async Task<bool> Deletar(int id)
        {
            var ingresso = await _db.Ingressos.FindAsync(id);
            if (ingresso == null) return false;

            _db.Ingressos.Remove(ingresso);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
