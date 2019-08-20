/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 17]
*/
alter table [Episode] add [ContentType] int null
GO
CREATE INDEX [idx_Episode_ContentType] ON [Episode]([ContentType]);
GO
alter table [EpisodeLng] add [VideoLink] nvarchar(max) null
GO
update [Episode] set [ContentType] = 1 where [Id] > 0
GO