import type { Scheme, Role, ServerRole, RoleRightsGroup, MergedScheme } from '#types/permissions';
export declare type RoleMergeFunction = (roles: Array<Role>) => MergedScheme;
export declare function getRoleMergeClojure(scheme: Scheme): RoleMergeFunction;
export declare function getPermissionsFromScheme(mergedScheme: MergedScheme): RoleRightsGroup;
export declare function getRoleWithLowCaseKeys(serverRole: ServerRole): Role;
export default getRoleMergeClojure;
//# sourceMappingURL=permission-functions.d.ts.map