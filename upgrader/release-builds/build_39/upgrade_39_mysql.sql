/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 39`
*/
CREATE INDEX `idx_Event_State` ON `Event`(`State`);
GO
CREATE UNIQUE INDEX `u_Idx_Event_Name` ON `Event`(`Name`);
GO
CREATE INDEX `idx_Event_ShortName` ON `Event`(`ShortName`);
GO
CREATE INDEX `idx_Event_EffDate` ON `Event`(`EffDate`);
GO
CREATE UNIQUE INDEX `u_Idx_Period_Name` ON `Period`(`Name`);
GO
CREATE INDEX `idx_Period_ShortName` ON `Period`(`ShortName`);
GO
CREATE INDEX `idx_Period_State` ON `Period`(`State`);
GO
CREATE INDEX `idx_Period_LbEffDate` ON `Period`(`LbEffDate`);
GO
CREATE INDEX `idx_Period_RbEffDate` ON `Period`(`RbEffDate`);
GO
CREATE UNIQUE INDEX `u_Idx_Timeline_Name` ON `Timeline`(`Name`);
GO
CREATE INDEX `idx_Timeline_SpecifCode` ON `Timeline`(`SpecifCode`);
GO
CREATE INDEX `idx_Timeline_State` ON `Timeline`(`State`);
GO
CREATE INDEX `idx_Timeline_Order` ON `Timeline`(`Order`);
GO
CREATE INDEX `idx_Command_Number` ON `Command`(`Number`);
GO
CREATE INDEX `idx_Command_TimeCode` ON `Command`(`TimeCode`);
GO
CREATE INDEX `idx_Command_Code` ON `Command`(`Code`);
GO
CREATE INDEX `idx_CommandEvent_Number` ON `CommandEvent`(`Number`);
GO
