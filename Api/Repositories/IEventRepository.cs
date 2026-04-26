using Api.Models;

namespace Api.Repositories {
    public interface IEventRepository {
        Task<IEnumerable<Event>> GetAll();
        Task<Event?> GetById(int id);
        Task<Event> Create(Event ev);
        Task<Event?> Update(int id, Event updatedData);
        Task<bool> Delete(int id);
    }
}