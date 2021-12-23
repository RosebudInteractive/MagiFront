import _ from 'lodash';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dS = {
    dsb: {
        alias: 'dashboard',
        type: 'group',
        title: 'Панель управления издательским планом',
        items: {
            al: {
                alias: 'accessLevel',
                type: 'item',
                title: 'Уровень доступа',
                dataType: 'enum',
                mergeType: 'max',
                values: {
                    0: 'Нет доступа',
                    1: 'Просмотр',
                    2: 'Просмотр и редактирование',
                    3: 'Полный',
                },
                default: 0,
            },
        },
    },
};
const rightsMerger = {
    defaultScheme: {},
    init(scheme) {
        rightsMerger.defaultScheme = scheme;
    },
    logIt() {
        console.log(rightsMerger);
    },
    getMergedRoles(roles) {
        const rolesPermissionsArray = roles.map((role) => role.Permissions);
        const rolesPermissionsMerged = _.merge({}, ...rolesPermissionsArray);
        return { ...roles[0], Permissions: rolesPermissionsMerged };
    },
    getMergedRolesLinear(roles) {
        const role = rightsMerger.getMergedRoles(roles); //
        return rightsMerger.getMergedLinearStructure(role);
    },
    getMergedRole(role) {
        const schemePermissions = {};
        Object.entries(rightsMerger.defaultScheme).map((permission) => {
            // @ts-ignore
            schemePermissions[permission[0]] = {};
            // eslint-disable-next-line array-callback-return
            Object.entries(permission[1].items).map((pItem) => {
                // @ts-ignore
                schemePermissions[permission[0]][pItem[0]] = pItem[1].default;
            });
        });
        const mergedPermissions = _.merge(schemePermissions, role.Permissions);
        console.log('{...role, Permissions: mergedPermissions}, ', { ...role, Permissions: mergedPermissions });
        return { ...role, Permissions: mergedPermissions };
    },
    getMergedLinearStructure(role) {
        let result = [];
        if (rightsMerger.defaultScheme !== null && role !== null) {
            result = Object.entries(rightsMerger.defaultScheme)
                .map((permission) => {
                const item = {};
                item.title = permission[1].title;
                item.permissionCode = permission[0].toString();
                item.items = (permission[1].items && Object.keys(permission[1].items).length > 0)
                    ? Object.entries(permission[1].items).map((itemValue) => {
                        const value = _.get(role.Permissions, `${permission[0]}.${itemValue[0]}`);
                        return {
                            title: itemValue[1].title,
                            dataType: itemValue[1].dataType,
                            value: value === undefined ? itemValue[1].default : value,
                            fromScheme: value === undefined,
                            default: itemValue[1].default,
                            roleId: role.Id,
                            permissionCode: itemValue[0],
                            parentCode: permission[0],
                            name: itemValue[1].alias,
                            values: Object.entries(itemValue[1].values).map((val) => ({
                                label: val[1],
                                value: +val[0],
                            })),
                        };
                    }) : [];
                return item;
            });
        }
        return result;
    },
};
export default rightsMerger;
