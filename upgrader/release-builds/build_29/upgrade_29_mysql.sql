/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 29`
*/
alter table `PromoCode` add `PromoProductId` int null
GO
alter table `PromoCode` add `IsVisible` tinyint(1) null
GO
ALTER TABLE `PromoCode` ADD CONSTRAINT `FK_PromoCode_PromoProductId` FOREIGN KEY(`PromoProductId`)
REFERENCES `Product` (`Id`)
GO
alter table `Product` add `AccName` varchar(255) null
GO
alter table `InvoiceItem` add `AccName` nvarchar(255) null
GO
update `PromoCode` set `IsVisible` = 1 where `Id` > 0
GO
update `Product` set `AccName` = `Name` where `Id` > 0
GO
update `InvoiceItem` set `AccName` = `Name` where `Id` > 0
GO
