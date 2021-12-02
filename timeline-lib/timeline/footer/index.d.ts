/// <reference types="react" />
import { GestureResponderEvent } from 'react-native';
declare type Props = {
    fullScreenMode: boolean;
    zoom: number;
    enableToSwitchFS: boolean;
    onOpenPress: (event: GestureResponderEvent) => void;
    onClosePress: (event: GestureResponderEvent) => void;
    onZoomChange: Function;
    onSliderStop: Function;
};
export default function Footer(props: Props): JSX.Element;
export {};
