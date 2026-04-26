using ApiCs.Models;

namespace ApiCs.Repositories
{
    // Interface do repositório de Ingresso
    public interface IIngressoRepository {
        Task<List<Ingresso>> ListarTodos();
        Task<List<Ingresso>> ListarPorEvento(int eventoId);
        Task<Ingresso?> BuscarPorId(int id);
        Task<Ingresso> Criar(Ingresso ingresso);
        Task<bool> Deletar(int id);
    }
}
