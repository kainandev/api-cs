using Microsoft.EntityFrameworkCore;
using ApiCs.Data;
using ApiCs.Models;

namespace ApiCs.Repositories {
    // Repositório = responsável por todas as operações no banco relacionadas a Event
    // O Controller chama o Repositório; o Repositório fala com o banco.
    public class EventRepository {
        private readonly AppDbContext _db;

        public EventRepository(AppDbContext db) {
            _db = db;
        }

        // Busca todos os Events (traz os Tickets junto com JOIN automático)
        public async Task<List<Event>> ListarTodos() {
            return await _db.Events
                            .Include(e => e.Ticket)
                            .ToListAsync();
        }

        // Busca um Event pelo ID; retorna null se não existir
        public async Task<Event?> BuscarPorId(int id) {
            return await _db.Events
                            .Include(e => e.Ticket)
                            .FirstOrDefaultAsync(e => e.Id == id);
        }

        // Salva um novo Event no banco
        public async Task<Event> Criar(Event Event) {
            _db.Events.Add(Event);
            await _db.SaveChangesAsync();
            return Event;
        }

        // Atualiza um Event existente e salva no banco
        public async Task<Event?> Atualizar(int id, Event dadosNovos) {
            var Event = await _db.Events.FindAsync(id);
            if (Event == null) return null;

            Event.Name = dadosNovos.Name;
            Event.Address = dadosNovos.Address;
            Event.Date = dadosNovos.Date;
            Event.PriceBase = dadosNovos.PriceBase;
            Event.Amount = dadosNovos.Amount;
            Event.MinAge = dadosNovos.MinAge;

            await _db.SaveChangesAsync();
            return Event;
        }

        // Remove um Event do banco
        public async Task<bool> Deletar(int id) {
            var Event = await _db.Events.FindAsync(id);
            
            if (Event == null) {
                return false;
            }

            _db.Events.Remove(Event);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
