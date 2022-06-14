import { Role } from '#types/user';
import { UserFormData } from './types';
interface LeftPaneProps {
    values: UserFormData;
    roles: Array<Role>;
    isCreateMode: boolean;
    onFindUser: (email: string) => void;
}
declare const LeftPane: ({ values, isCreateMode, onFindUser, roles, }: LeftPaneProps) => JSX.Element;
export default LeftPane;
//# sourceMappingURL=left-pane.d.ts.map