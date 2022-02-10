import { roleWithDsbFullAccess, scheme as testScheme } from './mock-data';
export function getRoleMergeClojure(scheme) {
    const currentScheme = scheme;
    function isValue(node) {
        return ['string', 'number'].includes(typeof node);
    }
    function getRoleItem(role, path) {
        let current = role.permissions;
        const found = path.every((key) => {
            if (isValue(current))
                return false;
            current = current[key];
            return !!current;
        });
        return found && isValue(current) ? current : null;
    }
    function notEmpty(value) {
        return value !== null && value !== undefined;
    }
    function mergeItem(item, path, roles) {
        const values = roles
            .map((role) => getRoleItem(role, path))
            .filter(notEmpty);
        const numValues = values.map((value) => value);
        return {
            ...item,
            isDefault: values.length === 0,
            mergedValue: values.length
                ? Math.max(...numValues)
                : undefined,
        };
    }
    function mergeGroup(node, path, roles) {
        const group = { ...node, items: {} };
        return Object.entries(node.items).reduce((mergedGroup, [key, item]) => {
            if (item.type === 'group') {
                // eslint-disable-next-line no-param-reassign
                mergedGroup.items[key] = mergeGroup(item, [...path, key], roles);
            }
            if (item.type === 'item') {
                // eslint-disable-next-line no-param-reassign
                mergedGroup.items[key] = mergeItem(item, [...path, key], roles);
            }
            return mergedGroup;
        }, group);
    }
    return (roles) => {
        const result = {};
        return Object.entries(currentScheme).reduce((resultRole, [key, item]) => {
            if (item.type === 'group') {
                // eslint-disable-next-line no-param-reassign
                resultRole[key] = mergeGroup(item, [key], roles);
            }
            return resultRole;
        }, result);
    };
}
export default getRoleMergeClojure;
const mergeFunction = getRoleMergeClojure(testScheme);
console.log(mergeFunction([roleWithDsbFullAccess]));
