import { RoleRightsValue } from '../../@types/permissions';

export type ChangeHandler = (path: Array<string>, value: RoleRightsValue | undefined) => void;
