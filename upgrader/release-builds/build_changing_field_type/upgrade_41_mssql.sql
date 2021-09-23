/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 41]
*/
ALTER TABLE [dbo].[CompletedLesson] DROP CONSTRAINT [FK_CompletedLesson_LessonId]
GO
ALTER TABLE [dbo].[CompletedLesson] DROP CONSTRAINT [FK_CompletedLesson_UserId]
GO
CREATE INDEX [idx_CompletedLesson_LessonId] ON [CompletedLesson]([LessonId]);
GO
ALTER TABLE [dbo].[LsnHistory] DROP CONSTRAINT [FK_LsnHistory_LessonId]
GO
ALTER TABLE [dbo].[LsnHistory] DROP CONSTRAINT [FK_LsnHistory_UserId]
GO
