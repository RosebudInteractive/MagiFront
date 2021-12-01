import { IScrollable } from '../types/common';
export declare enum OffsetEnum {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right"
}
declare class ZoomHandler {
    private scrollContainer;
    private width;
    private zoom;
    private offset;
    private scrollPosition;
    constructor();
    setContainer(container: IScrollable): void;
    setWidth(value: number): void;
    getOffset(): number;
    setOffset(value: OffsetEnum | number): void;
    setScrollPosition(value: number): void;
    adjustForNewOffset(newValue: number, newZoom: number): void;
    adjustForZoom(newZoom: number): void;
}
declare const instance: ZoomHandler;
export default instance;
