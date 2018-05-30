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
