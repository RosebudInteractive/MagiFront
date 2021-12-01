/// <reference types="react" />
import { GestureResponderEvent } from 'react-native';
import { VisualItem } from '../types/common';
declare type Props = {
    item: VisualItem;
    indent: number;
    onClose: (event: GestureResponderEvent) => void;
    pinned?: boolean;
};
declare function Message(props: Props): JSX.Element;
declare namespace Message {
    var defaultProps: {
        pinned: boolean;
    };
}
export default Message;
