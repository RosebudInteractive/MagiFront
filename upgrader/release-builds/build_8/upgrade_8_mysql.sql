/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 8`
*/
alter table `User` add `CampaignId` int null
GO
ALTER TABLE `User` ADD CONSTRAINT `FK_User_CampaignId` FOREIGN KEY(`CampaignId`)
REFERENCES `Campaign` (`Id`)
GO
alter table `LsnHistory` add `CampaignId` int null
GO
ALTER TABLE `LsnHistory` ADD CONSTRAINT `FK_LsnHistory_CampaignId` FOREIGN KEY(`CampaignId`)
REFERENCES `Campaign` (`Id`)
GO
CREATE UNIQUE INDEX `u_Idx_Campaign_Source_Medium_Campaign` ON `Campaign`(`Source`, `Medium`, `Campaign`);
GO
