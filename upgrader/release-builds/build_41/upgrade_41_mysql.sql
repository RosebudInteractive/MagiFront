/*
** MySQL: Upgrade to version "ProtoOne" v.1.0.0.1 build 41
*/
ALTER TABLE `Account` add `PermissionScheme` LONGTEXT NULL
GO
ALTER TABLE `Role` ADD `IsBuiltIn` TINYINT(1) NULL
GO
ALTER TABLE `Role` add `Permissions` LONGTEXT NULL
GO
ALTER TABLE `User` add `Permissions` LONGTEXT NULL
GO
