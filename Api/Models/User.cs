namespace Api.Models {
    // Representa um usuário cadastrado na plataforma
    public class User {
        public string Id { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string CPF { get; set; } = "";
        public string Email { get; set; } = "";
        public DateTime DateOfBirth { get; set; }
        public UserStatus Status { get; set; } = UserStatus.Active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Ingressos comprados por este usuário (relação 1:N)
        public List<Ticket> Tickets { get; set; } = new();
    }
}