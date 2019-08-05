/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 15`
*/
CREATE UNIQUE INDEX `u_Idx_Test_Name` ON `Test`(`Name`);
GO
CREATE UNIQUE INDEX `u_Idx_TestLink_TestId_CourseId` ON `TestLink`(`TestId`, `CourseId`);
GO
CREATE UNIQUE INDEX `u_Idx_TestLink_TestId_LessonId` ON `TestLink`(`TestId`, `LessonId`);
GO
CREATE UNIQUE INDEX `u_Idx_Question_TestId_Number` ON `Question`(`TestId`, `Number`);
GO
CREATE UNIQUE INDEX `u_Idx_Answer_QuestionId_Number` ON `Answer`(`QuestionId`, `Number`);
GO
CREATE UNIQUE INDEX `u_Idx_InstanceQuestion_TestInstanceId_Number` ON `InstanceQuestion`(`TestInstanceId`, `Number`);
GO
