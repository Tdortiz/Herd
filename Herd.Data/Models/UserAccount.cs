namespace Herd.Data.Models
{
    public class UserAccountSecurity
    {
        public int SaltKey { get; set; }
        public string SaltedPassword { get; set; }
    }

    public class UserMastodonConnectionDetails
    {
        public int AppRegistrationID { get; set; }
        public string ApiAccessToken { get; set; }
        public string CreatedAt { get; set; }
        public string Scope { get; set; }
        public string TokenType { get; set; }
        public string MastodonUserID { get; set; }
    }

    public class UserAccount : DataModel
    {
        public string Email { get; set; }
        public UserAccountSecurity Security { get; set; }
        public UserMastodonConnectionDetails MastodonConnection { get; set; }
    }
}