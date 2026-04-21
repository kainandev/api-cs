namespace IngressosAPI.Models {
    // Tabela "Eventos" no banco de dados
    
    public class Evento {
        public int Id { get; set; }
        public string Nome { get; set; } = "";
        public string Local { get; set; } = "";
        public DateTime Data { get; set; }
        public decimal PrecoBase { get; set; }
        public int CapacidadeTotal { get; set; }
        public int IngressosVendidos { get; set; } = 0;
        public int IdadeMinima { get; set; } = 0;

        // Calculado na hora, não salvo no banco
        public int VagasRestantes => CapacidadeTotal - IngressosVendidos;

        // Um evento tem vários ingressos (relação 1:N)
        public List<Ingresso> Ingressos { get; set; } = new();
    }
}
