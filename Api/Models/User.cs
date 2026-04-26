namespace ApiCs.Models {
    public class User {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CPF { get; set; }
        public Status Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public enum Status {
        Active,
        Disabled,
        Deleted
    }
}