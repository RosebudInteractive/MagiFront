/*
** MySL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 4`
*/
CREATE TABLE `__GEN_ROWID_LsnHistory` (
  `Id` int(11) NOT NULL,
  `fake` int(11) NOT NULL,
  PRIMARY KEY (`fake`)
) ENGINE=InnoDB
GO
INSERT INTO `__GEN_ROWID_LsnHistory` (`Id`, `fake`) VALUES (0, 0)
GO
CREATE TABLE `LsnHistory` (
  `Id` int(11) NOT NULL,
  `Guid` varchar(36) NOT NULL,
  `GuidVer` varchar(36) NOT NULL,
  `SysTypeId` int(11) NOT NULL,
  `UserIdCr` int(11) DEFAULT NULL,
  `UserIdMdf` int(11) DEFAULT NULL,
  `TimeCr` datetime DEFAULT NULL,
  `TimeMdf` datetime DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  `LessonId` int(11) NOT NULL,
  `StDate` datetime NOT NULL,
  `FinDate` datetime NOT NULL,
  `LsnTime` float NOT NULL,
  `UserTime` float NOT NULL,
  `RawData` longtext NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_LsnHistory_SysTypeId` (`SysTypeId`),
  KEY `FK_LsnHistory_UserId` (`UserId`),
  KEY `FK_LsnHistory_LessonId` (`LessonId`),
  CONSTRAINT `FK_LsnHistory_LessonId` FOREIGN KEY (`LessonId`) REFERENCES `Lesson` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_LsnHistory_SysTypeId` FOREIGN KEY (`SysTypeId`) REFERENCES `SysDataObjTypes` (`Id`),
  CONSTRAINT `FK_LsnHistory_UserId` FOREIGN KEY (`UserId`) REFERENCES `User` (`SysParentId`)
) ENGINE=InnoDB
GO
CREATE INDEX `idx_LsnHistory_StDate` ON `LsnHistory`(`StDate`);
GO
CREATE INDEX `idx_LsnHistory_FinDate` ON `LsnHistory`(`FinDate`);
GO
