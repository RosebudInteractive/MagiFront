/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 9`
*/
alter table `Cheque` add `CampaignId` int null
GO
ALTER TABLE `Cheque` ADD CONSTRAINT `FK_Cheque_CampaignId` FOREIGN KEY(`CampaignId`)
REFERENCES `Campaign` (`Id`)
GO
