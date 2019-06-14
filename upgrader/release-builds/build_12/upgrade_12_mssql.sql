/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 12]
*/
alter table [CourseLng] add [VideoIntwLink] nvarchar(max) null
GO
alter table [CourseLng] add [VideoIntroLink] nvarchar(max) null
GO
