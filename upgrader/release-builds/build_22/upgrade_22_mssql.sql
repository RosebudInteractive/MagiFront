/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 22]
*/
alter table [AuthorLng] add [ShortDescription] nvarchar(max) null
GO
