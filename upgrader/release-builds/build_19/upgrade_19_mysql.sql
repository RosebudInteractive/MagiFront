/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 19`
*/
alter table `CourseLng` add `ShortDescription` longtext null
GO
alter table `CourseLng` add `TargetAudience` longtext null
GO
alter table `CourseLng` add `Aims` longtext null
GO
alter table `AuthorLng` add `Occupation` nvarchar(255) null
GO
alter table `AuthorLng` add `Employment` nvarchar(255) null
GO
CREATE UNIQUE INDEX `u_Idx_CompletedLesson_UserId_LessonId` ON `CompletedLesson`(`UserId`, `LessonId`);
GO
