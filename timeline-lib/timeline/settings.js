class Settings {
    horizontalPadding;
    message;
    zoom;
    axis;
    period;
    canvas;
    constructor() {
        this.axis = {
            itemMinWidth: 50,
        };
        this.horizontalPadding = 40;
        this.message = {
            minWidth: 236,
            maxWidth: 356,
            width: '24%',
            viewportCheckpoint: 2,
        };
        this.zoom = {
            multiplier: 1.35,
            step: 1,
            min: 0,
            max: 20,
            animation: {
                shortTime: 500,
                longTime: 700,
            },
        };
        this.period = {
            emptyWidth: 50,
            minTitleWidth: 150,
        };
        this.canvas = {
            minWidth: 700,
        };
    }
    isVerticalViewport(width) {
        return width ? width < this.message.minWidth * this.message.viewportCheckpoint : false;
    }
}
const SETTINGS = new Settings();
export default SETTINGS;
