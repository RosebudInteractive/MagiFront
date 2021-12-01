import { DataItem as DI, VisualItem as VI } from './common';
export declare namespace Period {
    class DataItem extends DI {
        startDay?: number;
        startMonth?: number;
        startYear: number;
        endDay?: number;
        endMonth?: number;
        endYear: number;
    }
    class VisualItem extends VI {
        startDay?: number;
        startMonth?: number;
        startYear: number;
        endDay?: number;
        endMonth?: number;
        endYear: number;
        title: string;
        calculatedDateStart: number;
        calculatedDateEnd: number;
    }
}
