/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 40]
*/
ALTER TABLE [PmTask] ADD [IsFinal] BIT NULL
GO
ALTER TABLE [PmTask] ADD [IsAutomatic] BIT NULL
GO
ALTER TABLE [PmTask] ADD [IsActive] BIT NULL
GO
ALTER TABLE [PmDepTask] ADD [IsConditional] BIT NULL
GO
ALTER TABLE [PmDepTask] ADD [IsDefault] BIT NULL
GO
ALTER TABLE [PmDepTask] ADD [IsActive] BIT NULL
GO
ALTER TABLE [PmDepTask] ADD [Result] BIT NULL
GO
ALTER TABLE [PmDepTask] add [Expression] NVARCHAR(MAX) NULL
GO
UPDATE [PmTask] SET [IsFinal] = 0, [IsAutomatic] = 0, [IsActive] = 1 WHERE [Id] > 0;
GO
UPDATE [PmDepTask] SET [IsConditional] = 0, [IsDefault] = 0, [IsActive] = 1 WHERE [Id] > 0;
GO
