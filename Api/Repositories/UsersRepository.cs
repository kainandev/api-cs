using Microsoft.EntityFrameworkCore;
using ApiCs.Data;
using ApiCs.Models;

namespace ApiCs.Repositories {
    public class UsersRepository : IUsersRepository {
        private readonly AppDbContext _context;

        public UsersRepository(AppDbContext context) {
            _context = context;
        }

        public async Task<IEnumerable<Users>> GetAll() {
            return await _context.Users
                .Where(u => u.Status != Status.Deleted)
                .ToListAsync();
        }

        public async Task<Users?> GetById(string id) {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Status != Status.Deleted);
        }

        public async Task<Users> Create(Users user) {
            user.Id = Guid.NewGuid().ToString();
            user.Status = Status.Active;
            user.CreatedAt = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<Users?> Update(string id, Users updated) {
            var user = await GetById(id);

            if (user is null) return null;

            user.Firstname = updated.Firstname;
            user.Lastname  = updated.Lastname;
            user.Cpf = updated.Cpf;

            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> DeleteAsync(string id) {
            var user = await GetById(id);

            if (user is null) return false;

            user.Status = Status.Deleted; // Soft delete
            await _context.SaveChangesAsync();

            return true;
        }
    }
}