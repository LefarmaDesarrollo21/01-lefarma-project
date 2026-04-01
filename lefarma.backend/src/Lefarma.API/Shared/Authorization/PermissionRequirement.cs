using Microsoft.AspNetCore.Authorization;

namespace Lefarma.API.Shared.Authorization;

// @lat: [[backend#Shared]]

/// <summary>
/// Requirement for permission-based authorization.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}
