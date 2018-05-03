import CWSPlayerElementImage from "./player-element-image";

export default class CWSPlayerElementImageDesign extends CWSPlayerElementImage {
    _setEvents(item) {
        item.draggable({
            start: (/*event, ui*/) => {
                item.css({
                    bottom: null,
                    right: null,
                    left: this._options.data.content.position.left + "%",
                    top: this._options.data.content.position.top + "%",
                    width: item.width() + "px",
                    height: item.height() + "px"
                });
                this._options.data.focused = true;
                this._broadcastFocused();
            },
            stop: (/*event, ui*/) => {
                item.css({
                    bottom: this._options.data.content.position.bottom + "%",
                    right: this._options.data.content.position.right + "%",
                    left: this._options.data.content.position.left + "%",
                    top: this._options.data.content.position.top + "%",
                    width: "",
                    height: ""
                });
                this._broadcastPosition();
            },
            drag: (event, ui) => {
                this._recalcPosition(event, ui);
            }
        }).resizable({
            handles: "n, e, s, w, ne, se, sw, nw",
            aspectRatio: item.height() ? item.width() / item.height() : 1,
            resize: (event, ui) => {
                this._recalcSize(event, ui);
            },
            stop: (event, ui) => {
                ui.element.css({
                    bottom: this._options.data.content.position.bottom + "%",
                    right: this._options.data.content.position.right + "%",
                    left: this._options.data.content.position.left + "%",
                    top: this._options.data.content.position.top + "%",
                    width: "", height: ""
                });
                this._broadcastPosition();
            }
        }).click(() => {
            this._options.data.focused = true;
            this._broadcastFocused();
        });

        item.find(".ws-maximize").click(() => {
            this._maximizeElement(item);
        });
    }

    _recalcSize(event, ui) {
        let pixWidth = ui.size.width;
        let pixHeight = ui.size.height;

        let contWidth = this._container.width();
        let contHeight = this._container.height();

        let right = 0;
        let bottom = 0;
        let left = 0;
        let top = 0;

        if (contWidth > 0) {
            right = (contWidth - ui.position.left - pixWidth)/contWidth * 100;
            left = ui.position.left/contWidth * 100;
        }
        if (contHeight > 0) {
            bottom = (contHeight - pixHeight - ui.position.top)/contHeight * 100;
            top = ui.position.top/contHeight * 100;
        }

        this._options.data.content.position.bottom = bottom;
        this._options.data.content.position.right = right;
        this._options.data.content.position.left = left;
        this._options.data.content.position.top = top;
    }

    _recalcPosition(event, ui) {
        //this._options.data.position.left
        let pixLeft = ui.position.left;
        let pixTop = ui.position.top;

        let contWidth = this._container.width();
        let contHeight = this._container.height();

        let left = 0;
        let top = 0;
        if (contWidth > 0) left = pixLeft/contWidth * 100;
        if (contHeight > 0) top = pixTop/contHeight * 100;

        this._options.data.content.position.right =
            this._options.data.content.position.right - (left - this._options.data.content.position.left);
        this._options.data.content.position.bottom =
            this._options.data.content.position.bottom - (top - this._options.data.content.position.top);
        this._options.data.content.position.left = left;
        this._options.data.content.position.top = top;

    }

    _broadcastFocused() {
        if (this._options.onFocused)
            this._options.onFocused({
                trackElId: this._options.data.trackElement
            });
    }

    _maximizeElement(item) {
        this._calcMaxSize();
        item.css({
            bottom: this._options.data.content.position.bottom + "%",
            right: this._options.data.content.position.right + "%",
            left: this._options.data.content.position.left + "%",
            top: this._options.data.content.position.top + "%",
            width: "",
            height: ""
        });

        this._broadcastPosition();
    }

    _broadcastPosition() {
        if (this._options.onSetPosition)
            this._options.onSetPosition({
                trackElId: this._options.data.trackElement,
                position: {
                    bottom: this._options.data.content.position.bottom,
                    right: this._options.data.content.position.right,
                    left: this._options.data.content.position.left,
                    top: this._options.data.content.position.top
                }
            });
    }
}
//    }
//);