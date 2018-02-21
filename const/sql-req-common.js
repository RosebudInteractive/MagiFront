module.exports = {
    ACCOUNT_ID: 1,
    LANGUAGE_ID: 1,
    AUTHORS_BY_ID_MSSQL_PUBLIC_REQ:
        "select a.[Id], l.[FirstName], l.[LastName], a.[Portrait], a.[PortraitMeta], a.[URL] from [Author] a\n" +
        "  join[AuthorLng] l on l.[AuthorId] = a.[Id]\n" +
        "where a.[Id] in (<%= authors %>)",
    AUTHORS_BY_ID_MYSQL_PUBLIC_REQ:
        "select a.`Id`, l.`FirstName`, l.`LastName`, a.`Portrait`, a.`PortraitMeta`, a.`URL` from `Author` a\n" +
        "  join`AuthorLng` l on l.`AuthorId` = a.`Id`\n" +
        "where a.`Id` in (<%= authors %>)"
};