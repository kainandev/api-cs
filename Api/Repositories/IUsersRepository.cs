using ApiCs.Models;

namespace ApiCs.Repositories {
    public interface IUsersRepository {
        Task<IEnumerable<User>> GetAll();
        Task<User?> GetById(string id);
        Task<User> Create(User user);
        Task<User?> Update(string id, User user);
        Task<bool> Delete(string id);
    }
}