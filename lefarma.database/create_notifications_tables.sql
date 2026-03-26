-- Script para crear las tablas de notificaciones
-- Estas tablas son necesarias para el sistema de notificaciones

-- Tabla Notifications
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications' AND schema_id = 1)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [Type] nvarchar(50) NOT NULL DEFAULT 'info',
        [Priority] nvarchar(20) NOT NULL DEFAULT 'normal',
        [Category] nvarchar(100) NOT NULL DEFAULT 'system',
        [TemplateId] nvarchar(100) NULL,
        [TemplateData] nvarchar(max) NULL,
        [CreatedBy] nvarchar(100) NOT NULL DEFAULT 'system',
        [ScheduledFor] datetime2 NULL,
        [ExpiresAt] datetime2 NULL,
        [RetryCount] int NOT NULL DEFAULT 0,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id])
    );

    CREATE INDEX [IX_Notifications_CreatedAt] ON [Notifications] ([CreatedAt]);
    CREATE INDEX [IX_Notifications_ExpiresAt] ON [Notifications] ([ExpiresAt]);
    CREATE INDEX [IX_Notifications_ScheduledFor] ON [Notifications] ([ScheduledFor]);
    CREATE INDEX [IX_Notifications_ScheduledFor_Priority] ON [Notifications] ([ScheduledFor], [Priority]);
    CREATE INDEX [IX_Notifications_Type_CreatedAt] ON [Notifications] ([Type], [CreatedAt]);

    PRINT 'Tabla Notifications creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla Notifications ya existe';
END
GO

-- Tabla NotificationChannels
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NotificationChannels' AND schema_id = 1)
BEGIN
    CREATE TABLE [NotificationChannels] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [NotificationId] int NOT NULL,
        [ChannelType] nvarchar(50) NOT NULL,
        [Status] nvarchar(20) NOT NULL DEFAULT 'pending',
        [Recipient] nvarchar(500) NOT NULL,
        [SentAt] datetime2 NULL,
        [ErrorMessage] nvarchar(max) NULL,
        [RetryCount] int NOT NULL DEFAULT 0,
        [ExternalId] nvarchar(200) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_NotificationChannels] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_NotificationChannels_Notifications_NotificationId] FOREIGN KEY ([NotificationId]) REFERENCES [Notifications]([Id]) ON DELETE CASCADE
    );

    CREATE INDEX [IX_NotificationChannels_ChannelType] ON [NotificationChannels] ([ChannelType]);
    CREATE INDEX [IX_NotificationChannels_NotificationId] ON [NotificationChannels] ([NotificationId]);
    CREATE INDEX [IX_NotificationChannels_Status] ON [NotificationChannels] ([Status]);
    CREATE UNIQUE INDEX [UX_NotificationChannels_Notification_ChannelType_Recipient] ON [NotificationChannels] ([NotificationId], [ChannelType], [Recipient]);

    PRINT 'Tabla NotificationChannels creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla NotificationChannels ya existe';
END
GO

-- Tabla UserNotifications
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserNotifications' AND schema_id = 1)
BEGIN
    CREATE TABLE [UserNotifications] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [NotificationId] int NOT NULL,
        [UserId] int NOT NULL,
        [IsRead] bit NOT NULL DEFAULT 0,
        [ReadAt] datetime2 NULL,
        [ReceivedVia] nvarchar(max) NOT NULL DEFAULT '[]',
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_UserNotifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserNotifications_Notifications_NotificationId] FOREIGN KEY ([NotificationId]) REFERENCES [Notifications]([Id])
    );

    CREATE INDEX [IX_UserNotifications_IsRead] ON [UserNotifications] ([IsRead]);
    CREATE INDEX [IX_UserNotifications_NotificationId] ON [UserNotifications] ([NotificationId]);
    CREATE INDEX [IX_UserNotifications_UserId] ON [UserNotifications] ([UserId]);
    CREATE INDEX [IX_UserNotifications_UserId_NotificationId] ON [UserNotifications] ([UserId], [NotificationId]);

    PRINT 'Tabla UserNotifications creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla UserNotifications ya existe';
END
GO

PRINT 'Script completado. Tablas de notificaciones verificadas/creadas.';
GO
