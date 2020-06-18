/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 32`
*/
CREATE INDEX `idx_MrktSysLog_SysCode` ON `MrktSysLog`(`SysCode`);
GO
CREATE INDEX `idx_MrktSysLog_OpType` ON `MrktSysLog`(`OpType`);
GO
CREATE INDEX `idx_MrktSysLog_OpDate` ON `MrktSysLog`(`OpDate`);
GO
CREATE INDEX `idx_MrktSysLog_OpId` ON `MrktSysLog`(`OpId`);
GO
CREATE INDEX `idx_MrktSysLog_HttpStatus` ON `MrktSysLog`(`HttpStatus`);
GO
CREATE INDEX `idx_MrktSysLog_Succeeded` ON `MrktSysLog`(`Succeeded`);
GO
CREATE INDEX `idx_MrktSysLog_Trial` ON `MrktSysLog`(`Trial`);
GO
