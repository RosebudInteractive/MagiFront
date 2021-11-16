/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 45]
*/
CREATE UNIQUE INDEX [u_Idx_UserInterest_UserId_CategoryId] ON [UserInterest]([UserId],[CategoryId]);
GO
