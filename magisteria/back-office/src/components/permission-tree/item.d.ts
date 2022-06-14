/// <reference types="react" />
import { MergedItem, RoleRightsValue } from '../../@types/permissions';
interface ItemProps {
    permission: MergedItem;
    readonly?: boolean;
    onChange: (path: Array<string>, value: RoleRightsValue | undefined) => void;
    path: Array<string>;
}
declare function Item({ permission, readonly, onChange, path, }: ItemProps): JSX.Element;
declare namespace Item {
    var defaultProps: {
        readonly: boolean;
    };
}
export default Item;
//# sourceMappingURL=item.d.ts.map