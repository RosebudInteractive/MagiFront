/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 11]
*/
alter table [CourseLng] add [SnPost] nvarchar(max) null
GO
alter table [CourseLng] add [SnName] nvarchar(max) null
GO
alter table [CourseLng] add [SnDescription] nvarchar(max) null
GO
