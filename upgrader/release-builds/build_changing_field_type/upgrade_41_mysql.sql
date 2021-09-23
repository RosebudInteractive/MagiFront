/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 41`
*/
ALTER TABLE `CompletedLesson` DROP FOREIGN KEY `FK_CompletedLesson_LessonId`
GO
ALTER TABLE `CompletedLesson` DROP INDEX `FK_CompletedLesson_LessonId`
GO
ALTER TABLE `CompletedLesson` DROP FOREIGN KEY `FK_CompletedLesson_UserId`
GO
CREATE INDEX `idx_CompletedLesson_LessonId` ON `CompletedLesson`(`LessonId`);
GO
ALTER TABLE `LsnHistory` DROP FOREIGN KEY `FK_LsnHistory_LessonId`
GO
ALTER TABLE `LsnHistory` DROP INDEX `FK_LsnHistory_LessonId`
GO
ALTER TABLE `LsnHistory` DROP FOREIGN KEY `FK_LsnHistory_UserId`
GO
ALTER TABLE `LsnHistory` DROP INDEX `FK_LsnHistory_UserId`
GO
CREATE INDEX `idx_LsnHistory_UserId` ON `LsnHistory`(`UserId`);
GO
CREATE INDEX `idx_LsnHistory_LessonId` ON `LsnHistory`(`LessonId`);
GO
