/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 4]
*/
CREATE TABLE [dbo].[__GEN_ROWID_LsnHistory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[fake] [tinyint] NULL
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[LsnHistory](
	[Id] [int] NOT NULL,
	[Guid] [uniqueidentifier] NOT NULL,
	[GuidVer] [uniqueidentifier] NOT NULL,
	[SysTypeId] [int] NOT NULL,
	[UserIdCr] [int] NULL,
	[UserIdMdf] [int] NULL,
	[TimeCr] [datetime2](7) NULL,
	[TimeMdf] [datetime2](7) NULL,
	[UserId] [int] NOT NULL,
	[LessonId] [int] NOT NULL,
	[StDate] [datetime2](7) NOT NULL,
	[FinDate] [datetime2](7) NOT NULL,
	[LsnTime] [float] NOT NULL,
	[UserTime] [float] NOT NULL,
	[RawData] [nvarchar](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
)
GO
ALTER TABLE [dbo].[LsnHistory] WITH CHECK ADD CONSTRAINT [FK_LsnHistory_LessonId] FOREIGN KEY([LessonId])
REFERENCES [dbo].[Lesson] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[LsnHistory] WITH CHECK ADD CONSTRAINT [FK_LsnHistory_SysTypeId] FOREIGN KEY([SysTypeId])
REFERENCES [dbo].[SysDataObjTypes] ([Id])
GO
ALTER TABLE [dbo].[LsnHistory] WITH CHECK ADD CONSTRAINT [FK_LsnHistory_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([SysParentId])
GO
CREATE INDEX [idx_LsnHistory_StDate] ON [LsnHistory]([StDate]);
GO
CREATE INDEX [idx_LsnHistory_FinDate] ON [LsnHistory]([FinDate]);
GO
CREATE INDEX [idx_LsnHistory_UserId] ON [LsnHistory]([UserId]);
GO
CREATE INDEX [idx_LsnHistory_LessonId] ON [LsnHistory]([LessonId]);
GO
