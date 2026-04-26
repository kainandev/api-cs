using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Repositories {
    // Responsável por todas as operações de banco de dados relacionadas a Ticket
    public class TicketRepository : ITicketRepository {
        private readonly AppDbContext _db;

        public TicketRepository(AppDbContext db) {
            _db = db;
        }

        // Retorna todos os ingressos com os dados do lote incluso
        public async Task<IEnumerable<Ticket>> GetAll() {
            return await _db.Tickets
                .Include(t => t.EventTicket)
                .ToListAsync();
        }

        // Retorna um ingresso pelo ID com os dados do lote incluso
        public async Task<Ticket?> GetById(string id) {
            return await _db.Tickets
                .Include(t => t.EventTicket)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        // Retorna todos os ingressos comprados por um usuário específico
        public async Task<IEnumerable<Ticket>> GetByUserId(string userId) {
            return await _db.Tickets
                .Include(t => t.EventTicket)
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        // Retorna todos os ingressos de um evento, usado para controle de entrada
        public async Task<IEnumerable<Ticket>> GetByEventId(int eventId) {
            return await _db.Tickets
                .Include(t => t.EventTicket)
                .Where(t => t.EventTicket != null && t.EventTicket.EventId == eventId)
                .ToListAsync();
        }

        // Cria um novo ingresso (comprovante de compra) com ID gerado automaticamente
        public async Task<Ticket> Create(Ticket ticket) {
            ticket.Id = Guid.NewGuid().ToString();
            ticket.PurchasedAt = DateTime.UtcNow;
            ticket.IsUsed = false;

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();

            return ticket;
        }

        public async Task<bool> Delete(string id) {
            var ticket = await _db.Tickets.FindAsync(id);

            if (ticket == null) {
                return false;
            }

            _db.Tickets.Remove(ticket);
            await _db.SaveChangesAsync();

            return true;
        }

        // Marca o ingresso como utilizado na entrada do evento
        public async Task<bool> CheckIn(string id) {
            var ticket = await _db.Tickets.FindAsync(id);

            if (ticket == null) {
                return false;
            }

            ticket.IsUsed = true;
            ticket.UsedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return true;
        }
    }
}