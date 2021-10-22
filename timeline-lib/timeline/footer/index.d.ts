/// <reference types="react" />
import { GestureResponderEvent } from 'react-native';
declare type Props = {
    fullScreenMode: boolean;
    zoom: number;
    onOpenPress: (event: GestureResponderEvent) => void;
    onClosePress: (event: GestureResponderEvent) => void;
    onZoomChange: Function;
    onSliderStop: Function;
};
export default function Footer(props: Props): JSX.Element;
export {};
