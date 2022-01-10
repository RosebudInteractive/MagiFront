// eslint-disable-next-line max-classes-per-file
import { DataItem as DI, VisualItem as VI } from './common';

export namespace Event {
  export declare class DataItem extends DI {
    public day?: number;

    public month?: number;

    public year: number;
  }

  export declare class VisualItem extends VI {
    public day?: number;

    public month?: number;

    public year: number;

    public calculatedDate: number;
  }
}

export type EventDataItem = {
  label: string,
  data: Event.DataItem[]
}

export type EventsData = EventDataItem[]
