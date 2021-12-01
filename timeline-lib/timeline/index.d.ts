/// <reference types="react" />
import { Event } from '../types/event';
import { Period } from '../types/period';
import './timeline.sass';
declare type Props = {
    backgroundImage: string;
    events: Event.VisualItem[];
    periods: Period.VisualItem[];
    levelLimit: {
        events: number;
        periods: number;
    };
    visibilityChecking: boolean;
    elementsOverAxis: boolean;
};
export default function Timeline(props: Props): JSX.Element;
export {};
