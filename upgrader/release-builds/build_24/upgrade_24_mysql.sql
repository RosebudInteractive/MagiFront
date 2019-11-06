/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 24`
*/
alter table `Test` add `Cover` varchar(255) null
GO
alter table `Test` add `CoverMeta` longtext null
GO
alter table `Test` add `URL` varchar(255) null
GO
alter table `Test` add `SnPost` longtext null
GO
alter table `Test` add `SnName` longtext null
GO
alter table `Test` add `SnDescription` longtext null
GO
update `Test` set `URL` = concat('test-', cast(`Id`as char(255))) where `Id` > 0
GO
CREATE UNIQUE INDEX `u_Idx_Test_URL` ON `Test`(`URL`);
GO
