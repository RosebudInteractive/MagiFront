/// <reference types="react" />
import { PData, Role } from '#types/user';
import { MergedScheme } from '#types/permissions';
import { UserFormData } from './types';
interface UserFormsProps {
    initValues: UserFormData;
    roles: Array<Role>;
    mergedScheme: MergedScheme;
    isCreateMode: boolean;
    onSubmit: (values: PData) => void;
    onFindUser: (email: string) => void;
    onChange: (data: UserFormData) => void;
}
declare const UserForm: ({ onSubmit, isCreateMode, onFindUser, roles, mergedScheme, onChange, initValues, }: UserFormsProps) => JSX.Element;
export default UserForm;
//# sourceMappingURL=form.d.ts.map