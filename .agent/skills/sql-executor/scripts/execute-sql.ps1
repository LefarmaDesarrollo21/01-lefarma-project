# SQL Executor Script for Lefarma
# Usage: .\execute-sql.ps1 -Database Artricenter_Produccion -Query "SELECT * FROM app.Empresas"

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,

    [Parameter(Mandatory=$true)]
    [ValidateSet("Artricenter_Produccion", "Asistencias", "Asokam")]
    [string]$Database,

    [switch]$UseWindowsAuth
)

# Database configurations
$databases = @{
    "Artricenter_Produccion" = @{
        Server = "192.168.4.2"
        Database = "Artricenter_Produccion"
        User = "sisco1"
        Password = "L3f5rm5$$001"
    }
    "Asistencias" = @{
        Server = "192.168.1.5"
        Database = "Asistencias"
        User = "sisco2Asistencias"
        Password = "L3f5rm5$$001"
    }
    "Asokam" = @{
        Server = "192.168.4.2"
        Database = "Asokam"
        User = "coreapi"
        Password = "L4_CL4VE_S3cReta_Y_sUp3r__SEGUR4_123!"
    }
}

$db = $databases[$Database]

if ($UseWindowsAuth) {
    $connectionString = "Server=$($db.Server);Database=$($db.Database);Trusted_Connection=True;TrustServerCertificate=True"
} else {
    $connectionString = "Server=$($db.Server);Database=$($db.Database);User Id=$($db.User);Password=$($db.Password);Connection Timeout=360;TrustServerCertificate=True;Encrypt=False"
}

Write-Host "Executing query on $($db.Server)/$($db.Database)..." -ForegroundColor Cyan

try {
    # Try using SqlServer module
    if (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue) {
        Invoke-Sqlcmd -ServerInstance $db.Server -Database $db.Database -Username $db.User -Password $db.Password -Query $Query | Format-Table -AutoSize
    }
    # Fallback to .NET
    else {
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $command = New-Object System.Data.SqlClient.SqlCommand($Query, $connection)
        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
        $dataset = New-Object System.Data.DataSet

        $connection.Open()
        $adapter.Fill($dataset)
        $connection.Close()

        $dataset.Tables[0] | Format-Table -AutoSize
    }
}
catch {
    Write-Host "Error executing query: $_" -ForegroundColor Red
}
