/// <reference types="react" />
import { GestureResponderEvent } from 'react-native';
import { VisualItem } from '../types/common';
declare type Props = {
    item: VisualItem;
    indent: number;
    onClose: (event: GestureResponderEvent) => void;
};
export default function Message(props: Props): JSX.Element;
export {};
