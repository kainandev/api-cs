using ApiCs.Models;

namespace ApiCs.Repositories {
    // Interface define o "contrato" do repositório
    // Ou seja, quais métodos qualquer repositório de Event DEVE ter
    // Isso separa a lógica da aplicação do acesso ao banco
    public interface IEventRepository {
        Task<List<Event>> ListarTodos();
        Task<Event> BuscarPorId(int id);
        Task<Event> Criar(Event Event);
        Task<Event> Atualizar(int id, Event Event);
        Task<bool> Deletar(int id);
    }
}
