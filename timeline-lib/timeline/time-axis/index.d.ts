/// <reference types="react" />
import { Event } from '../../types/event';
import { Period } from '../../types/period';
import { LevelLimit } from '../../types/common';
import { Theme } from '../../types/theme';
declare type Props = {
    theme: Theme;
    width: number;
    height: number;
    events: Event.VisualItem[];
    zoom: number;
    periods: Period.VisualItem[];
    levelLimit: LevelLimit;
    zoomSliderStopped: boolean;
    visibilityChecking: boolean;
    elementsOverAxis: boolean;
    onItemClick?: Function;
    onItemDoubleClick?: Function;
};
export default function TimeAxis(props: Props): JSX.Element | null;
export {};
