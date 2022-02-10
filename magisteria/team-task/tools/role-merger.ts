import {
  Scheme,
  Role,
  MergedRole,
  SchemeItem,
  MergedItem,
  SchemeGroup,
  RoleRightsItem,
  RoleRightsGroup,
  MergedGroup,
  MergedScheme, RoleRightsValue,
} from '../@types/permissions';
import { roleWithDsbFullAccess, scheme as testScheme } from './mock-data';

export type RoleMergeFunction = (roles: Array<Role>) => MergedRole;

export function getRoleMergeClojure(scheme: Scheme): RoleMergeFunction {
  const currentScheme: Scheme = scheme;

  function isValue(
    node: RoleRightsItem | RoleRightsGroup | RoleRightsValue,
  ): node is RoleRightsValue {
    return ['string', 'number'].includes(typeof node);
  }

  function getRoleItem(role: Role, path: Array<string>): RoleRightsValue | null {
    let current: RoleRightsItem | RoleRightsGroup | RoleRightsValue = role.permissions;

    const found = path.every((key) => {
      if (isValue(current)) return false;
      current = current[key];
      return !!current;
    });

    return found && isValue(current) ? current as RoleRightsValue : null;
  }

  function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }

  function mergeItem(item: SchemeItem, path: Array<string>, roles: Array<Role>): MergedItem {
    const values: Array<RoleRightsValue> = roles
      .map((role) => getRoleItem(role, path))
      .filter(notEmpty);

    const numValues = values.map((value) => value as number);

    return {
      ...item,
      isDefault: values.length === 0,
      mergedValue: values.length
        ? Math.max(...numValues)
        : undefined,
    };
  }

  function mergeGroup(node: SchemeGroup, path: Array<string>, roles: Array<Role>): any {
    const group: MergedGroup = { ...node, items: {} };

    return Object.entries(node.items).reduce((mergedGroup: MergedGroup, [key, item]) => {
      if (item.type === 'group') {
        // eslint-disable-next-line no-param-reassign
        mergedGroup.items[key] = mergeGroup(item as SchemeGroup, [...path, key], roles);
      }

      if (item.type === 'item') {
        // eslint-disable-next-line no-param-reassign
        mergedGroup.items[key] = mergeItem(item as SchemeItem, [...path, key], roles);
      }

      return mergedGroup;
    },
    group);
  }

  return (roles: Array<Role>): MergedScheme => {
    const result: MergedScheme = {};

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
