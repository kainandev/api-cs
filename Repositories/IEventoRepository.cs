using IngressosAPI.Models;

namespace IngressosAPI.Repositories
{
    // Interface define o "contrato" do repositório
    // Ou seja, quais métodos qualquer repositório de Evento DEVE ter
    // Isso separa a lógica da aplicação do acesso ao banco
    public interface IEventoRepository
    {
        Task<List<Evento>> ListarTodos();
        Task<Evento?> BuscarPorId(int id);
        Task<Evento> Criar(Evento evento);
        Task<Evento?> Atualizar(int id, Evento evento);
        Task<bool> Deletar(int id);
    }
}
