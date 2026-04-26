using Api.Models;

namespace Api.Repositories {
    public interface IEventTicketRepository {
        Task<IEnumerable<EventTicket>> GetAll();
        Task<IEnumerable<EventTicket>> GetByEventId(int eventId);
        Task<EventTicket?> GetById(int id);
        Task<EventTicket> Create(EventTicket eventTicket);
        Task<EventTicket?> Update(int id, EventTicket updatedData);
        Task<bool> Delete(int id);
        Task<bool> IncrementSold(int id);
        Task<bool> DecrementSold(int id);
    }
}