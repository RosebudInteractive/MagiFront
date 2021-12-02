/// <reference types="react" />
import { Event } from '../types/event';
import { Period } from '../types/period';
import './timeline.sass';
declare type Props = {
    backgroundImage: string;
    height: number;
    events: Event.VisualItem[];
    periods: Period.VisualItem[];
    levelLimit: {
        events: number;
        periods: number;
    };
    visibilityChecking: boolean;
    elementsOverAxis: boolean;
    onFullScreen?: Function;
    onCloseFullScreen?: Function;
    onChangeOrientation?: Function;
};
export default function Timeline(props: Props): JSX.Element;
export {};
