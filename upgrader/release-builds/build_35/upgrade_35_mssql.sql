/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 35]
*/
CREATE INDEX [idx_PmProcess_State] ON [PmProcess]([State]);
GO
CREATE INDEX [idx_PmProcess_Name] ON [PmProcess]([Name]);
GO
CREATE INDEX [idx_PmProcess_DueDate] ON [PmProcess]([DueDate]);
GO
CREATE UNIQUE INDEX [u_Idx_PmProcessStruct_Name] ON [PmProcessStruct]([Name]);
GO
CREATE UNIQUE INDEX [u_Idx_PmElement_StructId_Name] ON [PmElement]([StructId],[Name]);
GO
CREATE INDEX [idx_PmElement_Index] ON [PmElement]([Index]);
GO
CREATE INDEX [idx_PmElemProcess_State] ON [PmElemProcess]([State]);
GO
CREATE INDEX [idx_PmElemProcess_Index] ON [PmElemProcess]([Index]);
GO
CREATE INDEX [idx_PmTask_State] ON [PmTask]([State]);
GO
CREATE INDEX [idx_PmTask_Name] ON [PmTask]([Name]);
GO
CREATE INDEX [idx_PmTask_DueDate] ON [PmTask]([DueDate]);
GO
CREATE INDEX [idx_PmTask_IsElemReady] ON [PmTask]([IsElemReady]);
GO
CREATE UNIQUE INDEX [u_Idx_PmDepTask_TaskId_DepTaskId] ON [PmDepTask]([TaskId],[DepTaskId]);
GO
CREATE UNIQUE INDEX [u_Idx_PmElemProcess_ProcessId_ElemId] ON [PmElemProcess]([ProcessId],[ElemId]);
GO
