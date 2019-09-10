/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 19]
*/
alter table [Course] add [LandCover] nvarchar(255) null
GO
alter table [Course] add [LandCoverMeta] nvarchar(max) null
GO
alter table [Course] add [IsLandingPage] bit null
GO
alter table [CourseLng] add [ShortDescription] nvarchar(max) null
GO
alter table [CourseLng] add [TargetAudience] nvarchar(max) null
GO
alter table [CourseLng] add [Aims] nvarchar(max) null
GO
alter table [CourseLng] add [EstDuration] int null
GO
alter table [AuthorLng] add [Occupation] nvarchar(255) null
GO
alter table [AuthorLng] add [Employment] nvarchar(255) null
GO
CREATE UNIQUE INDEX [u_Idx_CompletedLesson_UserId_LessonId] ON [CompletedLesson]([UserId], [LessonId]);
GO
