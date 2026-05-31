using Api.Models;

namespace Api.Repositories {
    public interface IUserRepository {
        Task<IEnumerable<User>> GetAll();
        Task<User?> GetById(string id);
        Task<User> Create(User user);
        Task<User?> Update(string id, User updatedData);
        Task<bool> Delete(string id);
    }
}