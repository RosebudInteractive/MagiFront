/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 6`
*/
alter table `Course` add `IsPaid` tinyint(1) null
GO
alter table `Course` add `IsSubsFree` tinyint(1) null
GO
alter table `Course` add `ProductId` int null
GO
alter table `Lesson` add `IsFreeInPaidCourse` tinyint(1) null
GO
alter table `Product` add `Ver` int null
GO
ALTER TABLE `Course` ADD CONSTRAINT `FK_Course_ProductId` FOREIGN KEY(`ProductId`)
REFERENCES `Product` (`Id`)
GO
update `VATType` set `ExtFields` = '{"yandexKassaCode":4}' where `Id` = 1
GO
update `VATType` set `ExtFields` = '{"yandexKassaCode":3}' where `Id` = 2
GO
update `VATRate` set `ExtFields` = '{"yandexKassaCode":4}' where `Id` = 1
GO
update `VATRate` set `ExtFields` = '{"yandexKassaCode":3}' where `Id` = 2
GO
