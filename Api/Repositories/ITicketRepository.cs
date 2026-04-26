using ApiCs.Models;

namespace ApiCs.Repositories
{
    // Interface do repositório de Ticket
    public interface ITicketRepository {
        Task<List<Ticket>> ListarTodos();
        Task<List<Ticket>> ListarPorEvent(int EventId);
        Task<Ticket?> BuscarPorId(int id);
        Task<Ticket> Criar(Ticket Ticket);
        Task<bool> Deletar(int id);
    }
}
