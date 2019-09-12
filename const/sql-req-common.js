module.exports = {
    ACCOUNT_ID: 1,
    LANGUAGE_ID: 1,
    EpisodeContentType: {
        AUDIO: 1,
        VIDEO: 2
    },
    AUTHORS_BY_ID_MSSQL_PUBLIC_REQ:
        "select a.[Id], l.[FirstName], l.[LastName], l.[Occupation], l.[Employment], l.[Description], a.[Portrait], a.[PortraitMeta], a.[URL] from [Author] a\n" +
        "  join[AuthorLng] l on l.[AuthorId] = a.[Id]\n" +
        "where a.[Id] in (<%= authors %>)",
    AUTHORS_BY_ID_MYSQL_PUBLIC_REQ:
        "select a.`Id`, l.`FirstName`, l.`LastName`, l.`Occupation`, l.`Employment`, l.`Description`, a.`Portrait`, a.`PortraitMeta`, a.`URL` from `Author` a\n" +
        "  join`AuthorLng` l on l.`AuthorId` = a.`Id`\n" +
        "where a.`Id` in (<%= authors %>)",
    CHECK_IF_CAN_DEL_LESSON_MSSQL:
        "select l.[Id] from [Lesson] l\n" +
        "  join[LessonCourse] lc on lc.[LessonId] = l.[Id]\n" +
        "  join [EpisodeLesson] el on el.[LessonId] = l.[Id]\n" +
        "  join [Episode] e on e.[Id] = el.[EpisodeId]\n" +
        "  join [EpisodeLng] eln on e.[Id] = eln.[EpisodeId]\n" +
        "where(l.[Id] = <%= id %>) and((lc.[State] = 'R') or(eln.[State] = 'R'))",
    CHECK_IF_CAN_DEL_LESSON_MYSQL:
        "select l.`Id` from `Lesson` l\n" +
        "  join`LessonCourse` lc on lc.`LessonId` = l.`Id`\n" +
        "  join `EpisodeLesson` el on el.`LessonId` = l.`Id`\n" +
        "  join `Episode` e on e.`Id` = el.`EpisodeId`\n" +
        "  join `EpisodeLng` eln on e.`Id` = eln.`EpisodeId`\n" +
        "where(l.`Id` = <%= id %>) and((lc.`State` = 'R') or(eln.`State` = 'R'))"
};