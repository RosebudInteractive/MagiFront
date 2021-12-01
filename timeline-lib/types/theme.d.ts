import { FontWeight } from './common';
declare class Font {
    family?: string;
    size?: number;
    weight?: FontWeight;
    color: string;
}
export declare class Theme {
    title: string;
    font?: Font;
    palette: string[];
    enableAlpha: boolean;
    constructor();
    getColor(index: number): string;
}
export declare class ThemeController {
    themes: Theme[];
    current: Theme;
    setCurrent(value: number): void;
}
export {};
