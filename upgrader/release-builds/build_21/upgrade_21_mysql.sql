/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 21`
*/
alter table `Cheque` add `LastTrialTs` datetime null
GO
alter table `Cheque` add `TrialNum` int null
GO
alter table `Cheque` add `ReceiptDate` datetime null
GO
alter table `Cheque` add `ReceiptData` longtext null
GO
CREATE INDEX `idx_Cheque_TrialNum` ON `Cheque`(`TrialNum`);
GO
CREATE INDEX `idx_Cheque_ReceiptDate` ON `Cheque`(`ReceiptDate`);
GO
