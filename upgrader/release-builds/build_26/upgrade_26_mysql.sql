/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 26`
*/
alter table `Test` add `IsAuthRequired` tinyint(1) null
GO
CREATE UNIQUE INDEX `u_Idx_TestInstanceShared_Code` ON `TestInstanceShared`(`Code`);
GO
