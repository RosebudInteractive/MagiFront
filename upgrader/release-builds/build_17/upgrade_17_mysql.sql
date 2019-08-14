/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 17`
*/
alter table `Test` add `Status` int null
GO
CREATE INDEX `idx_Test_Status` ON `Test`(`Status`);
GO
