/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 2]
*/
update [Product] set [Discontinued] = 1 where [Code] in ('SUBSFREE1M','SUBSFREE3M','SUBS1M')
GO
update [Price] set [Price] = 500 where [PriceListId] = 1 and [ProductId] = 4
GO
update [Price] set [Price] = 800 where [PriceListId] = 1 and [ProductId] = 5
GO
update [Price] set [Price] = 1400 where [PriceListId] = 1 and [ProductId] = 6
GO
update [User] set [SubsAutoPay] = 1 where [SysParentId] > 0
GO
alter table [CourseLng] add [ExtLinks] nvarchar(max) null
GO
alter table [LessonLng] add [ExtLinks] nvarchar(max) null
GO