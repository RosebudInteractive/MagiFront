class ZoomContainer {
    div;
    constructor(container) {
        this.div = container;
    }
    scrollTo(value) {
        this.div.scroll(value, 0);
    }
    get scrollLeft() {
        return this.div.scrollLeft;
    }
}
export default function wrap(div) {
    return new ZoomContainer(div);
}
