/// <reference types="react" />
import { Event } from '../../../types/event';
declare type Props = {
    events: Event.VisualItem[];
    startDate: number;
    elementsOverAxis: boolean;
    yearPerPixel: number;
    y: number;
    onCoordinatesReady: Function;
    onRecalculateTimelineEnding: Function;
    levelLimit: number;
    activeItem: number | null;
    onItemClick: Function;
};
export default function EventPoints(props: Props): JSX.Element | null;
export {};
