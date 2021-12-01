import { Event } from '../types/event';
import { Period } from '../types/period';
export declare const VERTICAL_STEP = 50;
export declare function calcEventPointPosition(event: Event.DataItem, needCorrectionOnBC: boolean): number;
export declare function isArrayEquals(array1: any[], array2: any[]): boolean;
export declare function calcScaleY(level: number, top: number): number;
export declare function calcDisplayDate(day: number | undefined, month: number | undefined, year: number, showBC?: boolean): string;
export declare function calcPeriodPoints(period: Period.DataItem, needCorrectionOnBC: boolean): {
    start: number;
    end: number;
};
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
};
export declare function transformEventToVisual(item: Event.DataItem): Event.VisualItem;
export declare function transformPeriodToVisual(item: Period.DataItem): Period.VisualItem;
