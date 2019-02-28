/*
** MySQL: Upgrade to version ["ProtoOne" v.1.0.0.1 build 5]
*/
CREATE INDEX `idx_Book_Name` ON `Book`(`Name`);
GO
CREATE INDEX `idx_Book_Order` ON `Book`(`Order`);
GO