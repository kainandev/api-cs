namespace ApiCs.Models {
    // Tabela "Events" no banco de dados

    public class Event {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public DateTime Date { get; set; }
        public decimal PriceBase { get; set; }
        public int Amount { get; set; }
        public int TicketsSells { get; set; } = 0;
        public int MinAge { get; set; } = 0;

        // Calculado na hora, não salvo no banco
        public int RestAmount => Amount - TicketsSells;

        // Um Event tem vários Tickets (relação 1:N)
        public List<Ticket> Ticket { get; set; } = new();
    }
}
