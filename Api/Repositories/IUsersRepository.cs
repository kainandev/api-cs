using ApiCs.Models;

namespace ApiCs.Repositories {
    public interface IUsersRepository {
        Task<IEnumerable<Users>> GetAll();
        Task<Users?> GetById(string id);
        Task<Users> Create(Users user);
        Task<Users?> Update(string id, Users user);
        Task<bool> Delete(string id);
    }
}