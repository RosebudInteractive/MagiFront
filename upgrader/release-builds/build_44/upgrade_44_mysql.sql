/*
** MySQL: Upgrade to version "ProtoOne" v.1.0.0.1 build 44
*/
ALTER TABLE `User` ADD `HasAppNotifCfg` TINYINT(1) NULL
GO
