/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 30]
*/
alter table [Test] add [Description] nvarchar(max) null
GO
alter table [Question] add [Comment] nvarchar(max) null
GO
alter table [User] add [RegProviderId] int null
GO
ALTER TABLE [User] WITH CHECK ADD CONSTRAINT [FK_User_RegProviderId] FOREIGN KEY([RegProviderId])
REFERENCES [SNetProvider] ([Id])
GO
