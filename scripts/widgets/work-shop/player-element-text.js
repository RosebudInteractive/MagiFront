import CWSPlayerElement from "./player-element"

export const etalonWidth = 1024;

export default class CWSPlayerElementText extends CWSPlayerElement {
    constructor (container, options) {
        super(container, options);
        this._textDiv = null;
    }

    _initItem(item) {
        let data = this._options.data;
        let cont = item.find(".ws-player-elem-content");

        let textDiv = document.createElement('div');
        this._textDiv = textDiv;
        textDiv.classList.add('ws-text-element');
        textDiv.id = Utils.guid();

        textDiv.contentEditable = "false";

        textDiv._textTools = {
            update: () => {
                let fSize = data.data.sizes[data.data.currentSize];
                let ratio = this._container.width() / etalonWidth;
                textDiv.style.fontSize =
                    (fSize * ratio) + 'px';
                textDiv.style.padding = (5 * ratio) + "px";
            }
        };


        $(textDiv).html(data.data.content);
        textDiv._textTools.update();
        cont.html(textDiv);
        item.fadeIn("fast");
    }

    _setEvents(item) {
        super._setEvents(item);
    }
}