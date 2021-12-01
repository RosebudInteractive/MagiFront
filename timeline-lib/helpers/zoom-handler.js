import SETTINGS from '../timeline/settings';
export var OffsetEnum;
(function (OffsetEnum) {
    OffsetEnum["LEFT"] = "left";
    OffsetEnum["CENTER"] = "center";
    OffsetEnum["RIGHT"] = "right";
})(OffsetEnum || (OffsetEnum = {}));
class ZoomHandler {
    scrollContainer;
    width = 0;
    zoom;
    offset;
    scrollPosition = 0;
    constructor() {
        this.scrollContainer = null;
        this.zoom = 1;
        this.offset = OffsetEnum.CENTER;
    }
    setContainer(container) {
        this.scrollContainer = container;
    }
    setWidth(value) {
        this.width = value;
    }
    getOffset() {
        if (typeof this.offset === 'number')
            return this.offset;
        switch (this.offset) {
            case OffsetEnum.LEFT: return 0;
            case OffsetEnum.CENTER: return this.width / 2;
            case OffsetEnum.RIGHT: return this.width;
            default: return 0;
        }
    }
    setOffset(value) {
        this.offset = value;
    }
    setScrollPosition(value) {
        this.scrollPosition = value;
    }
    adjustForNewOffset(newValue, newZoom) {
        if (this.scrollContainer) {
            const delta = newValue - this.getOffset();
            this.scrollContainer.scrollTo(this.scrollPosition + delta);
        }
        this.zoom = newZoom;
    }
    adjustForZoom(newZoom) {
        if (this.scrollContainer) {
            const leftOfViewPortMid = this.scrollPosition + this.getOffset() - SETTINGS.horizontalPadding;
            const newLeftValue = leftOfViewPortMid * (newZoom / this.zoom);
            this.scrollContainer.scrollTo(newLeftValue - this.getOffset() + SETTINGS.horizontalPadding);
        }
        this.zoom = newZoom;
    }
}
const instance = new ZoomHandler();
export default instance;
