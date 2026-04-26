using Microsoft.EntityFrameworkCore;
using ApiCs.Data;
using ApiCs.Models;

namespace ApiCs.Repositories {
    // Repositório responsável pelas operações de Ticket no banco
    public class TicketRepository {
        private readonly AppDbContext _db;

        public TicketRepository(AppDbContext db) {
            _db = db;
        }

        // Lista todos os Tickets com os dados do Event junto
        public async Task<List<Ticket>> ListarTodos() {
            return await _db.Tickets.Include(i => i.Event).ToListAsync();
        }

        // Lista os Tickets de um Event específico
        public async Task<List<Ticket>> ListarPorEvent(int EventId) {
            return await _db.Tickets.Where(i => i.EventId == EventId).ToListAsync();
        }

        // Busca um Ticket pelo ID
        public async Task<Ticket?> BuscarPorId(int id) {
            return await _db.Tickets.Include(i => i.Event).FirstOrDefaultAsync(i => i.Id == id);
        }

        // Salva um Ticket no banco
        public async Task<Ticket> Criar(Ticket Ticket) {
            _db.Tickets.Add(Ticket);
            await _db.SaveChangesAsync();
            return Ticket;
        }

        // Remove um Ticket do banco
        public async Task<bool> Deletar(int id) {
            var Ticket = await _db.Tickets.FindAsync(id);
            
            if (Ticket == null) {
                return false;
            }

            _db.Tickets.Remove(Ticket);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
