/// <reference types="react" />
import './permissions.sass';
import { MergedScheme } from '../../@types/permissions';
import { ChangeHandler } from './types';
interface PermissionsProps {
    scheme: MergedScheme;
    onChange?: ChangeHandler;
    readonly?: boolean;
}
declare function PermissionsTree({ scheme, onChange, readonly, }: PermissionsProps): JSX.Element;
declare namespace PermissionsTree {
    var defaultProps: {
        readonly: boolean;
    };
}
export default PermissionsTree;
//# sourceMappingURL=index.d.ts.map