/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 46]
*/
alter table [PmLsnProcess] add [TestURL] nvarchar(max) null
GO
