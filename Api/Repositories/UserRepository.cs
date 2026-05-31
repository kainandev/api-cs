using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Repositories {
    // Responsável por todas as operações de banco de dados relacionadas a User
    public class UserRepository : IUserRepository {
        private readonly AppDbContext _db;

        public UserRepository(AppDbContext db) {
            _db = db;
        }

        // Retorna todos os usuários ativos, excluindo os marcados como deletados
        public async Task<IEnumerable<User>> GetAll() {
            return await _db.Users
                .Where(u => u.Status != UserStatus.Deleted)
                .ToListAsync();
        }

        // Retorna um usuário pelo ID, ou null se não existir ou estiver deletado
        public async Task<User?> GetById(string id) {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Status != UserStatus.Deleted);
        }

        // Cria um novo usuário, gerando ID e definindo valores iniciais
        public async Task<User> Create(User user) {
            user.Id = Guid.NewGuid().ToString();
            user.Status = UserStatus.Active;
            user.CreatedAt = DateTime.UtcNow;

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user;
        }

        // Atualiza os dados editáveis de um usuário existente
        public async Task<User?> Update(string id, User updatedData) {
            var user = await GetById(id);

            if (user == null) {
                return null;
            }

            user.FirstName = updatedData.FirstName;
            user.LastName = updatedData.LastName;
            user.CPF = updatedData.CPF;
            user.Email = updatedData.Email;
            user.DateOfBirth = updatedData.DateOfBirth;

            await _db.SaveChangesAsync();

            return user;
        }

        // Soft delete: marca o usuário como deletado sem remover do banco
        public async Task<bool> Delete(string id) {
            var user = await GetById(id);

            if (user == null) {
                return false;
            }

            user.Status = UserStatus.Deleted;
            await _db.SaveChangesAsync();

            return true;
        }
    }
}