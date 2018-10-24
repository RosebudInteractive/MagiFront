CREATE UNIQUE INDEX `u_Idx_User_Email` ON `User`(`Email`);
GO
CREATE UNIQUE INDEX `u_Idx_SysUser_Login` ON `SysUser`(`Login`);
GO
CREATE UNIQUE INDEX `u_Idx_Account_Domain` ON `Account`(`Domain`);
GO
CREATE UNIQUE INDEX `u_Idx_AccountLng_Name` ON `AccountLng`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_Author_URL` ON `Author`(`URL`);
GO
CREATE UNIQUE INDEX `u_Idx_AuthorLng_FirstName_LastName` ON `AuthorLng`(`FirstName`, `LastName`);
GO
CREATE UNIQUE INDEX `u_Idx_Category_URL` ON `Category`(`URL`);
GO
CREATE UNIQUE INDEX `u_Idx_CategoryLng_Name` ON `CategoryLng`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_Course_URL` ON `Course`(`URL`);
GO
CREATE INDEX `idx_Course_State` ON `Course`(`State`);
GO
CREATE UNIQUE INDEX `u_Idx_CourseLng_Name` ON `CourseLng`(`Name`);
GO
CREATE INDEX `idx_CourseLng_State` ON `CourseLng`(`State`);
GO
CREATE INDEX `idx_EpisodeLng_State` ON `EpisodeLng`(`State`);
GO
CREATE UNIQUE INDEX `u_Idx_Language_Code` ON `Language`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_Language_LangTag` ON `Language`(`LangTag`);
GO
CREATE UNIQUE INDEX `u_Idx_Language_ShortName` ON `Language`(`ShortName`);
GO
CREATE UNIQUE INDEX `u_Idx_Language_Language` ON `Language`(`Language`);
GO
CREATE UNIQUE INDEX `u_Idx_Lesson_URL` ON `Lesson`(`URL`);
GO
CREATE INDEX `idx_LessonCourse_State` ON `LessonCourse`(`State`);
GO
CREATE INDEX `idx_LessonCourse_ReadyDate` ON `LessonCourse`(`ReadyDate`);
GO
CREATE UNIQUE INDEX `u_Idx_Role_Code` ON `Role`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_Role_Name` ON `Role`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_Role_ShortCode` ON `Role`(`ShortCode`);
GO
CREATE UNIQUE INDEX `u_Idx_SNetProfile_UserId_ProviderId` ON `SNetProfile`(`UserId`, `ProviderId`);
GO
CREATE INDEX `idx_SNetProfile_Identifier` ON `SNetProfile`(`Identifier`);
GO
CREATE UNIQUE INDEX `u_Idx_SNetProvider_Code` ON `SNetProvider`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_SNetProvider_Name` ON `SNetProvider`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_SNetProvider_URL` ON `SNetProvider`(`URL`);
GO
CREATE UNIQUE INDEX `u_Idx_Bookmark_UserId_CourseId` ON `Bookmark`(`UserId`, `CourseId`);
GO
CREATE UNIQUE INDEX `u_Idx_Bookmark_UserId_LessonCourseId` ON `Bookmark`(`UserId`, `LessonCourseId`);
GO
CREATE UNIQUE INDEX `u_Idx_ProductType_Code` ON `ProductType`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_ProductType_Name` ON `ProductType`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_Currency_Code` ON `Currency`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_Currency_Name` ON `Currency`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_VATType_Code` ON `VATType`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_VATType_Name` ON `VATType`(`Name`);
GO
CREATE INDEX `idx_VATRate_FirstDate` ON `VATRate`(`FirstDate`);
GO
CREATE INDEX `idx_VATRate_LastDate` ON `VATRate`(`LastDate`);
GO
CREATE UNIQUE INDEX `u_Idx_Product_Code` ON `Product`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_Product_Name` ON `Product`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_PriceList_Code` ON `PriceList`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_PriceList_Name` ON `PriceList`(`Name`);
GO
CREATE INDEX `idx_Price_FirstDate` ON `Price`(`FirstDate`);
GO
CREATE INDEX `idx_Price_LastDate` ON `Price`(`LastDate`);
GO
CREATE UNIQUE INDEX `u_Idx_InvoiceType_Code` ON `InvoiceType`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_InvoiceType_Name` ON `InvoiceType`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_InvoiceState_Code` ON `InvoiceState`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_InvoiceState_Name` ON `InvoiceState`(`Name`);
GO
CREATE INDEX `idx_Invoice_Name` ON `Invoice`(`Name`);
GO
CREATE INDEX `idx_Invoice_InvoiceNum` ON `Invoice`(`InvoiceNum`);
GO
CREATE INDEX `idx_Invoice_InvoiceDate` ON `Invoice`(`InvoiceDate`);
GO
CREATE INDEX `idx_InvoiceItem_Code` ON `InvoiceItem`(`Code`);
GO
CREATE INDEX `idx_InvoiceItem_Name` ON `InvoiceItem`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_ChequeType_Code` ON `ChequeType`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_ChequeType_Name` ON `ChequeType`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_ChequeState_Code` ON `ChequeState`(`Code`);
GO
CREATE UNIQUE INDEX `u_Idx_ChequeState_Name` ON `ChequeState`(`Name`);
GO
CREATE INDEX `idx_Cheque_Name` ON `Cheque`(`Name`);
GO
CREATE INDEX `idx_Cheque_ChequeNum` ON `Cheque`(`ChequeNum`);
GO
CREATE INDEX `idx_Cheque_ChequeDate` ON `Cheque`(`ChequeDate`);
GO
CREATE INDEX `idx_ChequeLog_ResultCode` ON `ChequeLog`(`ResultCode`);
GO
CREATE INDEX `idx_User_SubsExpDate` ON `User`(`SubsExpDate`);
GO
CREATE INDEX `idx_User_SubsExpDate` ON `AutoSubscription`(`SubsExpDate`);
GO
CREATE INDEX `idx_User_NextSubsExpDate` ON `AutoSubscription`(`NextSubsExpDate`);
GO
CREATE INDEX `idx_User_Succeeded` ON `AutoSubscription`(`Succeeded`);
GO
CREATE UNIQUE INDEX `u_Idx_SubsNotification_UserId_SubsExpDate_Days` ON `SubsNotification`(`UserId`, `SubsExpDate`, `Days`);
GO
