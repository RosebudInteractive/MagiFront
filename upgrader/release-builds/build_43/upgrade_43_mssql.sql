/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 43]
*/
CREATE UNIQUE INDEX [u_Idx_ApplicationType_Code] ON [ApplicationType]([Code]);
GO
CREATE UNIQUE INDEX [u_Idx_ApplicationType_Name] ON [ApplicationType]([Name]);
GO
CREATE UNIQUE INDEX [u_Idx_NotificationType_Code] ON [NotificationType]([Code]);
GO
CREATE UNIQUE INDEX [u_Idx_NotificationType_Name] ON [NotificationType]([Name]);
GO
CREATE UNIQUE INDEX [u_Idx_NotifDeliveryType_Code] ON [NotifDeliveryType]([Code]);
GO
CREATE UNIQUE INDEX [u_Idx_NotifDeliveryType_Name] ON [NotifDeliveryType]([Name]);
GO
CREATE UNIQUE INDEX [u_Idx_NotificationTopicType_Code] ON [NotificationTopicType]([Code]);
GO
CREATE UNIQUE INDEX [u_Idx_NotificationTopicType_Name] ON [NotificationTopicType]([Name]);
GO
CREATE INDEX [idx_UserDevice_DevId] ON [UserDevice]([DevId]);
GO
CREATE UNIQUE INDEX [u_Idx_NotificationTopic_Name] ON [NotificationTopic]([Name]);
GO
CREATE INDEX [idx_NotificationTopic_ObjId] ON [NotificationTopic]([ObjId]);
GO
CREATE INDEX [idx_NotifTopicSubscriber_ObjId] ON [NotifTopicSubscriber]([ObjId]);
GO
CREATE UNIQUE INDEX [u_Idx_NotifEndPoint_AppTypeId_DevId] ON [NotifEndPoint]([AppTypeId],[DevId]);
GO
CREATE INDEX [idx_NotifEndPoint_ActiveUserId] ON [NotifEndPoint]([ActiveUserId]);
GO
CREATE INDEX [idx_NotificationMessage_Type] ON [NotificationMessage]([Type]);
GO
CREATE INDEX [idx_NotificationMessage_ObjId] ON [NotificationMessage]([ObjId]);
GO
CREATE INDEX [idx_NotifMsgRecipient_Type] ON [NotifMsgRecipient]([Type]);
GO
CREATE INDEX [idx_NotifMsgRecipient_Status] ON [NotifMsgRecipient]([Status]);
GO
CREATE INDEX [idx_NotifMsgRecipient_ObjId] ON [NotifMsgRecipient]([ObjId]);
GO
CREATE INDEX [idx_NotifMsgRecipient_StartedAt] ON [NotifMsgRecipient]([StartedAt]);
GO
CREATE INDEX [idx_NotificationMessage_Tag] ON [NotificationMessage]([Tag]);
GO
