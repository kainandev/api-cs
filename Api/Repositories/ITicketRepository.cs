using Api.Models;

namespace Api.Repositories {
    public interface ITicketRepository {
        Task<IEnumerable<Ticket>> GetAll();
        Task<Ticket?> GetById(string id);
        Task<IEnumerable<Ticket>> GetByUserId(string userId);
        Task<IEnumerable<Ticket>> GetByEventId(int eventId);
        Task<Ticket> Create(Ticket ticket);
        Task<bool> Delete(string id);
        Task<bool> CheckIn(string id);
    }
}