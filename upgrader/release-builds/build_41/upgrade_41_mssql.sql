/*
** MSSQL: Upgrade to version "ProtoOne" v.1.0.0.1 build 41
*/
ALTER TABLE [Account] add [PermissionScheme] NVARCHAR(MAX) NULL
GO
ALTER TABLE [Role] ADD [IsBuiltIn] BIT NULL
GO
ALTER TABLE [Role] add [Permissions] NVARCHAR(MAX) NULL
GO
ALTER TABLE [User] add [Permissions] NVARCHAR(MAX) NULL
GO
