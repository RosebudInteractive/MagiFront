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

export interface ServerRole {
  Id: number;
  Code: string;
  Name: string;
  ShortCode: string;
  Description: string;
  IsBuiltIn: boolean; // признак "системности", дана админу
  Permissions: RoleRightsGroup,
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
