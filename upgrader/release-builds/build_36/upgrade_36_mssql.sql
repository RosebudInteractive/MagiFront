/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 36]
*/
alter table [Cheque] add [PaymentType] int null
GO
update [Cheque] set [PaymentType] = 1 where [Id] > 0
GO
CREATE INDEX [idx_Cheque_PaymentType] ON [Cheque]([PaymentType]);
GO