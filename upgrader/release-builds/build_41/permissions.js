'use strict';
exports.AccountPermissionScheme = {
    dsb: {
        alias:"dashboard",
        type: "group",
        title: "Панель управления издательским планом",
        items: {
            al: {
                alias: "accessLevel",
                type: "item",
                title: "Уровень доступа",
                dataType: "enum",
                mergeType: "max",
                values: {
                    0: "Нет доступа",
                    1: "Просмотр",
                    2: "Просмотр и редактирование",
                    3: "Полный"
                },
                default: 0
            }
        }
    }
}
exports.Permissions = {
    pma: { dsb: { al: 3 } },
    pms: { dsb: { al: 2 } },
    pme: { dsb: { al: 1 } }
}