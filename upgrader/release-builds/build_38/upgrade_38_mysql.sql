/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 38`
*/
CREATE INDEX `idx_Notification_NotifType` ON `Notification`(`NotifType`);
GO
CREATE UNIQUE INDEX `u_Idx_Notification_NotifKey` ON `Notification`(`NotifKey`);
GO
CREATE INDEX `idx_Notification_IsRead` ON `Notification`(`IsRead`);
GO
CREATE INDEX `idx_Notification_IsUrgent` ON `Notification`(`IsUrgent`);
GO
CREATE INDEX `idx_Notification_IsSent` ON `Notification`(`IsSent`);
GO
