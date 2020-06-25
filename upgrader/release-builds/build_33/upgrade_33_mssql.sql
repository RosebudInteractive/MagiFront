/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 33]
*/
alter table [Discount] add [Code] nvarchar(50) null
GO
alter table [Discount] add [TtlMinutes] int null
GO
CREATE INDEX [idx_Discount_UserId] ON [Discount]([Code])
GO
