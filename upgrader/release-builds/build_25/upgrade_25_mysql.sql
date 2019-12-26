/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 25`
*/
alter table `Cheque` add `PromoCode` varchar(50) null;
GO
update `Cheque`, `PromoCode` set  `Cheque`.`PromoCode` = `PromoCode`.`Code`
  where `PromoCode`.`Id` = `Cheque`.`PromoCodeId`;
GO
CREATE INDEX `idx_Cheque_PromoCode` ON `Cheque`(`PromoCode`);
GO
