import CWSPlayerElement from "./player-element"

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
                textDiv.style.fontSize =
                    (data.data.sizes[data.data.currentSize] * data.data.ratio) + 'px';
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