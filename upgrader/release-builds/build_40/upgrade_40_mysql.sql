/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 40`
*/
ALTER TABLE `PmTask` ADD `IsFinal` TINYINT(1) NULL
GO
ALTER TABLE `PmTask` ADD `IsAutomatic` TINYINT(1) NULL
GO
ALTER TABLE `PmTask` ADD `IsActive` TINYINT(1) NULL
GO
ALTER TABLE `PmDepTask` ADD `IsConditional` TINYINT(1) NULL
GO
ALTER TABLE `PmDepTask` ADD `IsDefault` TINYINT(1) NULL
GO
ALTER TABLE `PmDepTask` ADD `IsActive` TINYINT(1) NULL
GO
ALTER TABLE `PmDepTask` ADD `Result` TINYINT(1) NULL
GO
ALTER TABLE `PmDepTask` add `Expression` LONGTEXT NULL
GO
UPDATE `PmTask` SET `IsFinal` = 0, `IsAutomatic` = 0, `IsActive` = 1 WHERE `Id` > 0;
GO
UPDATE `PmDepTask` SET `IsConditional` = 0, `IsDefault` = 0, `IsActive` = 1 WHERE `Id` > 0;
GO
