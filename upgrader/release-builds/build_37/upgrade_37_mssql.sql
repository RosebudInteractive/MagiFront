/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 37]
*/
alter table [PmElement] add [SupervisorId] int null
GO
ALTER TABLE [PmElement] WITH CHECK ADD CONSTRAINT [FK_PmElement_SupervisorId] FOREIGN KEY([SupervisorId])
REFERENCES [User] ([SysParentId])
GO
alter table [PmProcess] add [TechTransMusicResultURL] nvarchar(max) null
GO
