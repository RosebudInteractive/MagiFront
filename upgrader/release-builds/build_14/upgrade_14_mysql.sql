/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 14`
*/
alter table `Cheque` add `SendStatus` int null
GO
CREATE INDEX `idx_Cheque_SendStatus` ON `Cheque`(`SendStatus`);
GO
