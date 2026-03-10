namespace Lefarma.API.Services.Identity.Models;

/// <summary>
/// Represents a user retrieved from Active Directory.
/// </summary>
public class ActiveDirectoryUser
{
    /// <summary>
    /// The sAMAccountName (username) of the user.
    /// </summary>
    public string SamAccountName { get; set; } = string.Empty;

    /// <summary>
    /// The domain the user belongs to.
    /// </summary>
    public string Dominio { get; set; } = string.Empty;

    /// <summary>
    /// User's email address.
    /// </summary>
    public string? Mail { get; set; }

    /// <summary>
    /// User's display name.
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// User's first name (given name).
    /// </summary>
    public string? GivenName { get; set; }

    /// <summary>
    /// User's last name (surname).
    /// </summary>
    public string? Sn { get; set; }

    /// <summary>
    /// User's department.
    /// </summary>
    public string? Department { get; set; }

    /// <summary>
    /// User's payroll number.
    /// </summary>
    public string? NumeroNomina { get; set; }

    /// <summary>
    /// User's telephone number.
    /// </summary>
    public string? TelephoneNumber { get; set; }

    /// <summary>
    /// User's user principal name (email format).
    /// </summary>
    public string? UserPrincipalName { get; set; }

    /// <summary>
    /// Last logon time.
    /// </summary>
    public DateTime? LastLogon { get; set; }

    /// <summary>
    /// IP phone number.
    /// </summary>
    public string? TelefonoIP { get; set; }

    /// <summary>
    /// User's title/job title.
    /// </summary>
    public string? Titulo { get; set; }
}
