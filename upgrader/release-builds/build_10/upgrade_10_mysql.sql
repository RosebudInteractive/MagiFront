/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 10`
*/
alter table `Cheque` add `PromoCodeId` int null
GO
alter table `Cheque` add `PromoSum` decimal(12,4) null
GO
ALTER TABLE `Cheque` ADD CONSTRAINT `FK_Cheque_PromoCodeId` FOREIGN KEY(`PromoCodeId`)
REFERENCES `PromoCode` (`Id`)
GO
CREATE UNIQUE INDEX `u_Idx_PromoCode_Code` ON `PromoCode`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_UserGiftCourse_UserId_CourseId` ON `UserGiftCourse`(`UserId`, `CourseId`);
GO
CREATE UNIQUE INDEX `u_Idx_PromoCodeProduct_PromoCodeId_ProductId` ON `PromoCodeProduct`(`PromoCodeId`, `ProductId`);
GO
