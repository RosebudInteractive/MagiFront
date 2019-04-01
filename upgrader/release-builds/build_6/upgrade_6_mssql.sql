/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 6]
*/
alter table [Course] add [IsPaid] bit null
GO
alter table [Course] add [IsSubsFree] bit null
GO
alter table [Course] add [ProductId] int null
GO
alter table [Lesson] add [IsFreeInPaidCourse] bit null
GO
alter table [Product] add [Ver] int null
GO
ALTER TABLE [Course] WITH CHECK ADD CONSTRAINT [FK_Course_ProductId] FOREIGN KEY([ProductId])
REFERENCES [Product] ([Id])
GO
update [VATType] set [ExtFields] = '{"yandexKassaCode":4}' where [Id] = 1
GO
update [VATType] set [ExtFields] = '{"yandexKassaCode":3}' where [Id] = 2
GO
update [VATRate] set [ExtFields] = '{"yandexKassaCode":4}' where [Id] = 1
GO
update [VATRate] set [ExtFields] = '{"yandexKassaCode":3}' where [Id] = 2
GO
CREATE UNIQUE INDEX [u_Idx_UserPaidCourse_UserId_CourseId] ON [UserPaidCourse]([UserId], [CourseId]);
GO
CREATE INDEX [idx_EpisodeLng_Audio] ON [EpisodeLng]([Audio]);
GO