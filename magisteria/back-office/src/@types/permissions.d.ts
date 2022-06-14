export declare type RoleRightsValue = number | string;
export declare type RoleRightsItem = {
    [key: string]: RoleRightsValue;
};
export declare type RoleRightsGroup = {
    [key: string]: RoleRightsItem | RoleRightsGroup;
};
export interface Role {
    id: number;
    code: string;
    name: string;
    shortCode: string;
    description: string;
    isBuiltIn: boolean;
    permissions: RoleRightsGroup;
}
export interface ServerRole {
    Id: number;
    Code: string;
    Name: string;
    ShortCode: string;
    Description: string;
    IsBuiltIn: boolean;
    Permissions: RoleRightsGroup;
}
export interface MergedItem extends SchemeItem {
    mergedValue?: number | string;
    isDefault: boolean;
}
export interface MergedGroup extends Omit<SchemeGroup, 'items'> {
    items: {
        [key: string]: MergedItem | MergedGroup;
    };
}
export declare type MergedScheme = {
    [key: string]: MergedGroup;
};
declare const SCHEME_ENTRY_TYPE: string[];
declare const MERGE_TYPE: string[];
export declare type SchemeEntryType = typeof SCHEME_ENTRY_TYPE[number];
export declare type MergeType = typeof MERGE_TYPE[number];
interface SchemeEntry {
    alias: string;
    title: string;
    type: SchemeEntryType;
}
export interface SchemeGroup extends SchemeEntry {
    items: {
        [key: string]: SchemeItem | SchemeGroup;
    };
}
export interface SchemeItem extends SchemeEntry {
    dataType: 'enum' | 'number' | 'string';
    default: number | string;
    mergeType: MergeType;
    title: string;
    type: SchemeEntryType;
    values?: {
        [key: number]: string;
    };
}
export declare type Scheme = {
    [key: string]: SchemeGroup;
};
export {};
//# sourceMappingURL=permissions.d.ts.map