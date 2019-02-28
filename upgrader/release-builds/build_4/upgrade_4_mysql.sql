/*
** MySL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 4`
*/
CREATE INDEX `idx_LsnHistory_StDate` ON `LsnHistory`(`StDate`);
GO
CREATE INDEX `idx_LsnHistory_FinDate` ON `LsnHistory`(`FinDate`);
GO
