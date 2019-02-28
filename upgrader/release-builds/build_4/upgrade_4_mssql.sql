/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 4]
*/
CREATE INDEX [idx_LsnHistory_StDate] ON [LsnHistory]([StDate]);
GO
CREATE INDEX [idx_LsnHistory_FinDate] ON [LsnHistory]([FinDate]);
GO
CREATE INDEX [idx_LsnHistory_UserId] ON [LsnHistory]([UserId]);
GO
CREATE INDEX [idx_LsnHistory_LessonId] ON [LsnHistory]([LessonId]);
GO
