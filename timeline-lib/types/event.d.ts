import { DataItem as DI, VisualItem as VI } from './common';
export declare namespace Event {
    class DataItem extends DI {
        day?: number;
        month?: number;
        year: number;
    }
    class VisualItem extends VI {
        day?: number;
        month?: number;
        year: number;
        calculatedDate: number;
    }
}
