namespace ApiCs.Models {
    // Tabela "Ingressos" no banco de dados

    public class Ingresso {
        public int Id { get; set; }
        public string NomeComprador { get; set; } = "";
        public string CPF { get; set; } = "";
        public int Idade { get; set; }
        public TipoIngresso Tipo { get; set; } = TipoIngresso.Normal;
        public decimal PrecoFinal { get; set; }
        public DateTime DataCompra { get; set; } = DateTime.Now;

        // Chave estrangeira: a qual evento esse ingresso pertence
        public int EventoId { get; set; }
        public Evento Evento { get; set; }
    }
}
