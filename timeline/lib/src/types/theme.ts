// eslint-disable-next-line max-classes-per-file,@typescript-eslint/no-unused-vars
import { FontWeight } from './common';

declare class Font {
  family?: string;

  size?: number;

  weight?: FontWeight;

  color: string;
}

export class Theme {
  public title: string;

  public font?: Font;

  public palette: string[];

  public enableAlpha: boolean;

  constructor() {
    this.title = '';
    this.palette = [];
    this.enableAlpha = true;
  }

  public getColor(index: number) {
    const paletteIndex = index % this.palette.length;
    return this.palette[paletteIndex];
  }
}

export declare class ThemeController {
  public themes: Theme[];

  public current: Theme;

  setCurrent(value: number): void
}
