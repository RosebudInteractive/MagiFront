/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 23]
*/
alter table [Course] add [CourseType] int null
GO
update [Course] set [CourseType] = 1 where [Id] > 0
GO
CREATE INDEX [idx_Course_CourseType] ON [Course]([CourseType]);
GO
