import _ from 'lodash';
function customizer(objValue, srcValue) {
    return objValue >= srcValue ? objValue : srcValue;
}
const roleMerger = {
    defaultScheme: {},
    init(scheme) {
        roleMerger.defaultScheme = scheme;
    },
    getMergedRoles(roles) {
        const rolesPermissionsArray = roles.map((role) => role.Permissions);
        const rolesPermissionsMerged = _.merge({}, ...rolesPermissionsArray);
        return { ...roles[0], Permissions: rolesPermissionsMerged };
    },
    getMergedRolesByMaxValue(roles) {
        const rolesPermissionsArray = roles.map((role) => role.Permissions);
        const rolesPermissionsMerged = _.mergeWith({}, ...rolesPermissionsArray, customizer);
        return { ...roles[0], Permissions: rolesPermissionsMerged };
    },
    getMergedRolesLinear(roles) {
        const role = roleMerger.getMergedRoles(roles); //
        return roleMerger.getMergedLinearStructure(role);
    },
    getMergedRolesLinearByMaxValue(roles) {
        const role = roleMerger.getMergedRolesByMaxValue(roles); //
        return roleMerger.getMergedLinearStructure(role);
    },
    getMergedRole(role) {
        const schemePermissions = {};
        Object.entries(roleMerger.defaultScheme).map((permission) => {
            // @ts-ignore
            schemePermissions[permission[0]] = {};
            // eslint-disable-next-line array-callback-return
            Object.entries(permission[1].items).map((pItem) => {
                // @ts-ignore
                schemePermissions[permission[0]][pItem[0]] = pItem[1].default;
            });
        });
        const mergedPermissions = _.merge(schemePermissions, role.Permissions);
        return { ...role, Permissions: mergedPermissions };
    },
    getMergedLinearStructure(role) {
        let result = [];
        if (roleMerger.defaultScheme !== null && role !== null) {
            result = Object.entries(roleMerger.defaultScheme)
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
export default roleMerger;
