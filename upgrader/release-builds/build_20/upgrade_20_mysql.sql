/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 20`
*/
alter table `Cheque` add `SendStatusChangedAt` datetime null
GO
CREATE INDEX `idx_Cheque_SendStatusChangedAt` ON `Cheque`(`SendStatusChangedAt`);
GO
