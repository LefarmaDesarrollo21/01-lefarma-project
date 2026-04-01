namespace Lefarma.API.Domain.Entities.Auth;

    // @lat: [[backend#Domain]]

public class DominioConfig
{
    public int Id { get; set; }
    public string Dominio { get; set; } = string.Empty;
    public string Servidor { get; set; } = string.Empty;
    public int Puerto { get; set; } = 389;
    public string? BaseDn { get; set; }
}
