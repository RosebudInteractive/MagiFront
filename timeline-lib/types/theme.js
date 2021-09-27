export class Theme {
    title;
    font;
    palette;
    enableAlpha;
    constructor() {
        this.title = '';
        this.palette = [];
        this.enableAlpha = true;
    }
    getColor(index) {
        const paletteIndex = index % this.palette.length;
        return this.palette[paletteIndex];
    }
}
