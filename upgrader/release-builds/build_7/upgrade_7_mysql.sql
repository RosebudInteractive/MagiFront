/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 7`
*/
alter table `Course` add `PaidTp` int null
GO
alter table `Course` add `PaidDate` datetime null
GO
alter table `Course` add `PaidRegDate` datetime null
GO
update `Course` set `PaidTp` = 1 where `IsPaid` = 1;
GO
CREATE INDEX `idx_Course_PaidTp` ON `Course`(`PaidTp`);
GO
CREATE INDEX `idx_Course_PaidDate` ON `Course`(`PaidDate`);
GO
CREATE INDEX `idx_Course_PaidRegDate` ON `Course`(`PaidRegDate`);
GO