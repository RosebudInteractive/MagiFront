// declare namespace Permissions {
//   type SchemeValue = { label: string; value: number };
//
//   type SchemeItem = {
//     dataType: 'enum' | 'string';
//     default: number | string;
//     fromScheme: boolean;
//     name: string;
//     parentCode: string;
//     permissionCode: string;
//     roleId: number;
//     title: string;
//     value: number | string;
//     values: Array<SchemeValue>;
//   };
//
//   type SchemeGroup = {
//     permissionCode: string
//     title: string;
//     items: Array<SchemeItem>;
//   };
//
//
// }
export type RoleRightsValue = number | string;
export type RoleRightsItem = { [key: string]: RoleRightsValue };
export type RoleRightsGroup = { [key: string]: RoleRightsItem | RoleRightsGroup };

export interface Role {
  id: number;
  code: string;
  name: string;
  shortCode: string;
  description: string;
  isBuiltIn: boolean; // признак "системности", дана админу
  permissions: RoleRightsGroup,
}

export interface MergedRole {
  Permissions?: RoleRightsGroup,
}

export interface MergedItem extends SchemeItem{
  mergedValue?: number | string;
  isDefault: boolean;
}

export interface MergedGroup extends Omit<SchemeGroup, 'items'> {
  items:{ [key: string]: MergedItem | MergedGroup },
}

export type MergedScheme = { [key: string]: MergedGroup };

const SCHEME_ENTRY_TYPE = ['enum', 'item'];
const MERGE_TYPE = ['max', 'min'];

export type SchemeEntryType = typeof SCHEME_ENTRY_TYPE[number];
export type MergeType = typeof MERGE_TYPE[number];

interface SchemeEntry {
  alias: string;
  title: string;
  type: SchemeEntryType;
}

export interface SchemeGroup extends SchemeEntry {
  items: { [key: string]: SchemeItem | SchemeGroup }
}

export interface SchemeItem extends SchemeEntry {
  dataType: 'enum' | 'number' | 'string';
  default: number | string;
  mergeType: MergeType;
  title: string;
  type: SchemeEntryType;
  values?: { [key: number]: string };
}

export type Scheme = { [key: string]: SchemeGroup };
