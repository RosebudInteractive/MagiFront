export declare class DataItem {
    id: number;
    name: string;
    color: string;
    shortName?: string;
    description?: string;
}
export declare class VisualItem extends DataItem implements IVerticalPlaceable {
    displayDate: string;
    width: number;
    left: number;
    y: number;
    xStart: number;
    xEnd: number;
    yLevel: number;
    visible: boolean;
    offset: number;
}
export interface IVerticalPlaceable {
    xStart: number;
    xEnd: number;
    id: number;
    yLevel: number;
    visible?: boolean;
}
export declare enum ItemType {
    Event = "event",
    Period = "period"
}
export declare type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;
export declare type LevelLimit = {
    events: number;
    periods: number;
};
export interface IScrollable {
    scrollTo(x: number): void;
    scrollLeft: number;
}
