import CWSPlayerElementText from "./player-element-text";
import CWSElementDesignTools from "./player-element-design-tools";
import {etalonWidth} from "./player-element-text";

export default class CWSPlayerElementTextDesign extends CWSPlayerElementText {
    _setEvents(item) {
        super._setEvents(item);

        let textDiv = this._textDiv;
        let that = this;
        let textToolsDiv = $('.ws-text-element-tools');


        let selectionchangeFn = () => {
            let s = window.getSelection();
            let oRange = s.getRangeAt(0);
            let oRect = oRange.getBoundingClientRect();
            $(textToolsDiv).css({
                'top': oRect.top - 30,
                'left': oRect.right - $(textToolsDiv).width() / 2 - oRect.width / 2
            });

            let parents = [];
            let colors = [];
            let parentEl = oRange.commonAncestorContainer;
            let progress = true;

            while (progress) {
                if (parentEl.classList !== undefined) {
                    if (!parentEl.classList.contains('ws-text-element')) {
                        parents.push(parentEl);
                        colors.push(parentEl.style.backgroundColor);
                    } else {
                        progress = false;
                    }
                }
                if (parentEl.parentNode !== null) {
                    parentEl = parentEl.parentNode;
                } else {
                    progress = false;
                }
            }
            // console.log({parents, colors});
        };

        let overTools = false;

        let mousemoveFn = (e) => {
            let rect = $.extend({}, textDiv.getBoundingClientRect());
            let rect2 = textToolsDiv[0].getBoundingClientRect();

            overTools =
                rect.left <= e.clientX && rect.right >= e.clientX &&
                rect.top <= e.clientY && rect.bottom >= e.clientY ||
                rect2.left <= e.clientX && rect2.right >= e.clientX &&
                rect2.top <= e.clientY && rect2.bottom >= e.clientY;
        };

        textDiv.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!overTools) {
                    textDiv.contentEditable = "false";
                    $(textToolsDiv).removeClass('ws-text-element-tools-show');
                    if (item.hasClass('ui-draggable')) {
                        item.draggable('enable');
                        item.resizable('enable');
                    }
                    document.removeEventListener('mousemove', mousemoveFn);
                    document.removeEventListener("selectionchange", selectionchangeFn);
                }
            }, 100);
        });

        textDiv.addEventListener('blur', () => {
            setTimeout(() => {
                let data = that._options.data;
                data.data.content = $(textDiv).html();
                that._broadcastSetTextData();
                if (overTools) {
                    textDiv.focus();
                }
            }, 50);
        });

        textDiv.addEventListener('contextmenu', (e) => {
            let data = that._options.data;
            e.preventDefault();
            e.stopImmediatePropagation();
            window.textId = textDiv.id;
            textDiv.contentEditable = "true";
            item.draggable('disable');
            item.resizable('disable');

            textDiv.focus();
            $(textToolsDiv).addClass('ws-text-element-tools-show');
            document.addEventListener('mousemove', mousemoveFn);
            document.addEventListener("selectionchange", selectionchangeFn);
            let oRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
            let ratio = this._container.width() / etalonWidth;
            $(textToolsDiv).css({
                'top': oRect.top - 30 - (2/ratio),
                'left': oRect.right - $(textToolsDiv).width() / 2 - oRect.width / 2
            });
            $('.ws-text-element-tools-a').each((index, item) => {
                $(item).removeClass('ws-text-element-tools-a-selected');
            });
            $('.ws-text-element-tools-a' + (data.data.currentSize + 1))
                .addClass('ws-text-element-tools-a-selected');
            return false
        });

        item.click(() => {
            that._options.data.focused = true;
            that._broadcastFocused();
        });

        item.find(".ws-maximize").click(() => {
            that._maximizeElement(item);
        });

        item.draggable({
            start: () => {
                item.css({
                    bottom: null,
                    right: null,
                    left: that._options.data.content.position.left + "%",
                    top: that._options.data.content.position.top + "%",
                    width: item.width() + "px",
                    height: item.height() + "px"
                });
                that._options.data.focused = true;
                that._broadcastFocused();
            },
            stop: () => {
                item.css({
                    bottom: that._options.data.content.position.bottom + "%",
                    right: that._options.data.content.position.right + "%",
                    left: that._options.data.content.position.left + "%",
                    top: that._options.data.content.position.top + "%",
                    width: "",
                    height: ""
                });
                that._broadcastPosition();
            },
            drag: (event, ui) => {
                that._options.data.content.position =
                    CWSElementDesignTools.recalcPosition(
                        that._container, that._options.data.content.position, event, ui
                    );
            }
        }).resizable({
            handles: "n, e, s, w, ne, se, sw, nw",
            resize: (event, ui) => {
                that._options.data.content.position =
                    CWSElementDesignTools.recalcSize(
                        that._container, event, ui
                    );
            },
            stop: (event, ui) => {
                ui.element.css({
                    bottom: this._options.data.content.position.bottom + "%",
                    right: this._options.data.content.position.right + "%",
                    left: this._options.data.content.position.left + "%",
                    top: this._options.data.content.position.top + "%",
                    width: "", height: ""
                });
                that._broadcastPosition();
            }
        });
    }

    _initItem(item) {
        super._initItem(item);
        let textDiv = this._textDiv;
        let that = this;

        textDiv._textTools.setRatio = (ratio) => {
                //setTimeout(() => {
            let data = that._options.data;
            data.data.ratio = ratio;
            that._broadcastSetTextData();
            //}, 50);
        };
        textDiv._textTools.setCurrentSize = (size) => {
            //setTimeout(() => {
            let data = that._options.data;
            data.data.currentSize = size;
            that._broadcastSetTextData();
            //}, 50);
        };
        textDiv._textTools.grabContent = () => {
            that._options.data.data.content = $(textDiv).html();
            that._broadcastSetTextData();
        };

        this._setEvents(item);
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

    _calcMaxSize() {
        this._options.data.content.position.bottom = 0;
        this._options.data.content.position.right = 0;
        this._options.data.content.position.left = 0;
        this._options.data.content.position.top = 0;
    }

    _broadcastFocused() {
        if (this._options.onFocused)
            this._options.onFocused({
                trackElId: this._options.data.trackElement
            });
    }

    _broadcastPosition() {
        CWSElementDesignTools.broadcastPosition(
            this._options.onSetPosition,
            this._options.data.trackElement,
            this._options.data.content.position
        );
    }

    _broadcastSetTextData() {
        if (this._options.onSetTextData) {
            this._options.onSetTextData({
                trackElId: this._options.data.trackElement,
                data: this._options.data.data
            })
        }
    }



}
