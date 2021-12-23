// eslint-disable-next-line max-classes-per-file
import { DataItem as DI, VisualItem as VI } from './common';

export namespace Period {
  export declare class DataItem extends DI {
    public startDay?: number;

    public startMonth?: number;

    public startYear: number;

    public endDay?: number;

    public endMonth?: number;

    public endYear: number;
  }

  export declare class VisualItem extends VI {
    public startDay?: number;

    public startMonth?: number;

    public startYear: number;

    public endDay?: number;

    public endMonth?: number;

    public endYear: number;

    public title: string;

    public calculatedDateStart: number;

    public calculatedDateEnd: number;
  }
}
