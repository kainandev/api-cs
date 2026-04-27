namespace Api.Models {
    // Representa o comprovante de compra de um ingresso por um usuário.
    // Um Ticket é gerado quando um usuário compra a partir de um EventTicket (lote).
    public class Ticket {
        public string Id { get; set; } = "";   //ID único, evitar duplicidade/clonagem
        public decimal PriceFinal { get; set; }  //preço em 0,00
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;  //Data da compra
        public bool IsUsed { get; set; } = false;  //para saber se o tocket já foi usado ou não
        public DateTime? UsedAt { get; set; } //para saber quando o ticket foi usado, caso IsUsed = true

        // Chave estrangeira: usuário que realizou a compra
        public string UserId { get; set; } = ""; //puxa do User.cs

        // Chave estrangeira: lote do qual este ingresso foi comprado
        public int EventTicketId { get; set; } //puxa do EventTickets.cs

        // Dados do lote carregados para exibição (via Include no repositório)
        public EventTicket? EventTicket { get; set; } 
    }
}
