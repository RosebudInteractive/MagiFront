/// <reference types="react" />
import { GestureResponderEvent } from 'react-native';
declare type Props = {
    title: string;
    width: number | string;
    onOpenPress?: ((event: GestureResponderEvent) => void) | undefined;
};
export default function Header(props: Props): JSX.Element;
export {};
