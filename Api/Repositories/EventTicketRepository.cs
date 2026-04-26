using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Repositories {
    // Responsável por todas as operações de banco de dados relacionadas a EventTicket
    public class EventTicketRepository : IEventTicketRepository {
        private readonly AppDbContext _db;

        public EventTicketRepository(AppDbContext db) {
            _db = db;
        }

        public async Task<IEnumerable<EventTicket>> GetAll() {
            return await _db.EventTickets.ToListAsync();
        }

        // Retorna todos os lotes de um evento específico
        public async Task<IEnumerable<EventTicket>> GetByEventId(int eventId) {
            return await _db.EventTickets
                .Where(et => et.EventId == eventId)
                .ToListAsync();
        }

        public async Task<EventTicket?> GetById(int id) {
            return await _db.EventTickets.FindAsync(id);
        }

        // Cria um novo lote de ingressos com SoldAmount zerado
        public async Task<EventTicket> Create(EventTicket eventTicket) {
            eventTicket.SoldAmount = 0;
            eventTicket.CreatedAt = DateTime.UtcNow;

            _db.EventTickets.Add(eventTicket);
            await _db.SaveChangesAsync();

            return eventTicket;
        }

        // Atualiza os dados editáveis de um lote existente
        public async Task<EventTicket?> Update(int id, EventTicket updatedData) {
            var eventTicket = await _db.EventTickets.FindAsync(id);

            if (eventTicket == null) {
                return null;
            }

            eventTicket.Name = updatedData.Name;
            eventTicket.Description = updatedData.Description;
            eventTicket.Type = updatedData.Type;
            eventTicket.Price = updatedData.Price;
            eventTicket.TotalAmount = updatedData.TotalAmount;
            eventTicket.SalesStart = updatedData.SalesStart;
            eventTicket.SalesEnd = updatedData.SalesEnd;
            eventTicket.IsActive = updatedData.IsActive;

            await _db.SaveChangesAsync();

            return eventTicket;
        }

        public async Task<bool> Delete(int id) {
            var eventTicket = await _db.EventTickets.FindAsync(id);

            if (eventTicket == null) {
                return false;
            }

            _db.EventTickets.Remove(eventTicket);
            await _db.SaveChangesAsync();

            return true;
        }

        // Incrementa o contador de vendas do lote ao confirmar uma compra
        public async Task<bool> IncrementSold(int id) {
            var eventTicket = await _db.EventTickets.FindAsync(id);

            if (eventTicket == null) {
                return false;
            }

            eventTicket.SoldAmount++;
            await _db.SaveChangesAsync();

            return true;
        }

        // Decrementa o contador de vendas do lote ao cancelar um ingresso
        public async Task<bool> DecrementSold(int id) {
            var eventTicket = await _db.EventTickets.FindAsync(id);

            if (eventTicket == null) {
                return false;
            }

            eventTicket.SoldAmount--;
            await _db.SaveChangesAsync();

            return true;
        }
    }
}