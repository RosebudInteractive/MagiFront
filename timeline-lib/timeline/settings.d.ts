declare class Settings {
    horizontalPadding: number;
    message: {
        width: string | number;
        minWidth: number;
        maxWidth: number;
        viewportCheckpoint: number;
    };
    zoom: {
        multiplier: number;
        step: number;
        min: number;
        max: number;
        animation: {
            longTime: number;
            shortTime: number;
        };
    };
    axis: {
        itemMinWidth: number;
    };
    period: {
        emptyWidth: number;
        minTitleWidth: number;
    };
    constructor();
    isVerticalViewport(width: number): boolean;
}
declare const SETTINGS: Settings;
export default SETTINGS;
