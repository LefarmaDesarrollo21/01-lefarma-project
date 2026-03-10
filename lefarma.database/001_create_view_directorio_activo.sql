-- Create view to access Active Directory users from Asokam
-- Run this in Lefarma database

IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vwDirectorioActivo')
BEGIN
    EXEC('CREATE VIEW [dbo].[vwDirectorioActivo] AS SELECT 1 AS id')
END
GO

ALTER VIEW [dbo].[vwDirectorioActivo]
AS
SELECT 
    samAccountName,
    dominio,
    mail,
    displayName,
    givenName,
    sn,
    department,
    numeroNomina,
    telephoneNumber,
    userPrincipalName,
    LastLogon,
    TelefonoIP,
    Titulo
FROM [Asokam].[dbo].[vwDirectorioActivo]
GO
