using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Repositories {
    // Responsável por todas as operações de banco de dados relacionadas a Event
    public class EventRepository : IEventRepository {
        private readonly AppDbContext _db;

        public EventRepository(AppDbContext db) {
            _db = db;
        }

        // Retorna todos os eventos com seus lotes de ingressos
        public async Task<IEnumerable<Event>> GetAll() {
            return await _db.Events
                .Include(e => e.EventTickets)
                .ToListAsync();
        }

        // Retorna um evento pelo ID, incluindo seus lotes de ingressos
        public async Task<Event?> GetById(int id) {
            return await _db.Events
                .Include(e => e.EventTickets)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        // Cria um novo evento no banco com status e data de criação definidos aqui
        public async Task<Event> Create(Event ev) {
            ev.Status = EventStatus.Active;
            ev.CreatedAt = DateTime.UtcNow;

            _db.Events.Add(ev);
            await _db.SaveChangesAsync();

            return ev;
        }

        // Atualiza os dados editáveis de um evento existente
        public async Task<Event?> Update(int id, Event updatedData) {
            var ev = await _db.Events.FindAsync(id);

            if (ev == null) {
                return null;
            }

            ev.Name = updatedData.Name;
            ev.Address = updatedData.Address;
            ev.Description = updatedData.Description;
            ev.Date = updatedData.Date;
            ev.MinAge = updatedData.MinAge;
            ev.Status = updatedData.Status;

            await _db.SaveChangesAsync();

            return ev;
        }

        // Remove um evento permanentemente do banco
        public async Task<bool> Delete(int id) {
            var ev = await _db.Events.FindAsync(id);

            if (ev == null) {
                return false;
            }

            _db.Events.Remove(ev);
            await _db.SaveChangesAsync();

            return true;
        }
    }
}