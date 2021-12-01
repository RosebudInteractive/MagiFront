class Settings {
    horizontalPadding;
    message;
    zoom;
    axis;
    period;
    constructor() {
        this.axis = {
            itemMinWidth: 50,
        };
        this.horizontalPadding = 100;
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
    }
    isVerticalViewport(width) {
        return width < this.message.minWidth * this.message.viewportCheckpoint;
    }
}
const SETTINGS = new Settings();
export default SETTINGS;
