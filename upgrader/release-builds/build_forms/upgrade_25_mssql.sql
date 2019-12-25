/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 25]
*/
CREATE UNIQUE INDEX [u_Idx_SysResource_ResTypeId_Name] ON [SysResource]([ResTypeId],[Name]);
GO
