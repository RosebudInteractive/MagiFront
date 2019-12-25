/*
** MSSQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 25]
*/
alter table [Cheque] add [PromoCode] nvarchar(50) null;
GO
update c set c.[PromoCode] = p.[Code] from [Cheque] c
  join [PromoCode] p on p.[Id] = c.[PromoCodeId];
GO
CREATE INDEX [idx_Cheque_PromoCode] ON [Cheque]([PromoCode]);
GO
