using Microsoft.EntityFrameworkCore;
using ApiCs.Data;
using ApiCs.Models;

namespace ApiCs.Repositories {
    public class UsersRepository : IUsersRepository {
        private readonly AppDbContext _context;

        public UsersRepository(AppDbContext context) {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAll() {
            return await _context.Users
                .Where(u => u.Status != Status.Deleted)
                .ToListAsync();
        }

        public async Task<User?> GetById(string id) {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Status != Status.Deleted);
        }

        public async Task<User> Create(User user) {
            user.Id = Guid.NewGuid().ToString();
            user.Status = Status.Active;
            user.CreatedAt = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User?> Update(string id, User updated) {
            var user = await GetById(id);

            if (user is null) return null;

            user.FirstName = updated.FirstName;
            user.LastName  = updated.LastName;
            user.CPF = updated.CPF;

            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> Delete(string id) {
            var user = await GetById(id);

            if (user is null) return false;

            user.Status = Status.Deleted; // Soft delete
            await _context.SaveChangesAsync();

            return true;
        }
    }
}