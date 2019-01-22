/*
** MySL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 3`
*/
alter table `ProductType` add `ExtFields` longtext null
GO
update `ProductType` set `ExtFields` = '{"yandexKassa":{"payment_subject":"service"}}' where `Code` = 'SUBS'
GO
update `ProductType` set `ExtFields` = '{"yandexKassa":{"payment_subject":"commodity"}}' where `Code` = 'BOOK'
GO
update `ProductType` set `ExtFields` = '{"yandexKassa":{"payment_subject":"service"}}' where `Code` = 'AUDIOBOOK'
GO
update `ProductType` set `ExtFields` = '{"yandexKassa":{"payment_subject":"service"}}' where `Code` = 'EBOOK'
GO
update `VATType` set `Code` = 'VAT20', `Name` = 'НДС 20%', `ExtFields` = '{"yandexKassaCode":6}' where `Id` = 1
GO
update `VATType` set `ExtFields` = '{"yandexKassaCode":5}' where `Id` = 2
GO
update `VATRate` set `Rate` = 20.0, `ExtFields` = '{"yandexKassaCode":6}' where `Id` = 1
GO
update `VATRate` set `ExtFields` = '{"yandexKassaCode":5}' where `Id` = 2
GO
