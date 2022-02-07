// eslint-disable-next-line max-classes-per-file
export declare class DataItem {
  public id: number;

  public name: string;

  public color: string;

  public shortName?: string;

  public description?: string;

  public references?: number[][];

}

export declare class VisualItem extends DataItem implements IVerticalPlaceable {
  public displayDate: string;

  public width: number;

  public left: number;

  public y: number;

  public xStart: number;

  public xEnd: number;

  public yLevel: number;

  public visible: boolean;

  public offset: number;

  public visibleReferences?: boolean;
}

export interface IVerticalPlaceable {
  xStart: number,
  xEnd: number,
  id: number,
  yLevel: number,
  visible?: boolean
}

export enum ItemType {
  Event = 'event',
  Period = 'period',
}

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;

export type LevelLimit = { events: number, periods: number };

export interface IScrollable {
  scrollTo(x: number): void;
  scrollLeft: number;
}

export type ActiveItem = {
  type: ItemType,
  id: number,
  item: VisualItem,
};
