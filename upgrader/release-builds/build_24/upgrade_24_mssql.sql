/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 24]
*/
alter table [Test] add [Cover] nvarchar(255) null
GO
alter table [Test] add [CoverMeta] nvarchar(max) null
GO
alter table [Test] add [URL] nvarchar(255) null
GO
alter table [Test] add [SnPost] nvarchar(max) null
GO
alter table [Test] add [SnName] nvarchar(max) null
GO
alter table [Test] add [SnDescription] nvarchar(max) null
GO
update [Test] set [URL] = 'test-'+ convert(nvarchar(255),[Id]) where [Id] > 0
GO
CREATE UNIQUE INDEX [u_Idx_Test_URL] ON [Test]([URL]);
GO
