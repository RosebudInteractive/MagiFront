import { Event } from '../types/event';
import { Period } from '../types/period';
declare interface InputTimelineData {
    Events: any[];
    Periods: any[];
}
declare type TimelineData = {
    Events: Event.DataItem[];
    Periods: Period.DataItem[];
};
export default function convertData(data: InputTimelineData): TimelineData;
export {};
