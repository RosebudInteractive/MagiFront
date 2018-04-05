/**
 * Created by levan.kiknadze on 23/07/2017.
 */
import CWSBase from "./ws-base";
import tpl from 'text!./templates/work-shop.html';

//define(
//    ["./ws-base", 'text!./templates/work-shop.html'],
//    function (CWSBase, tpl) {
export default class CWSTrackTools extends CWSBase {
    constructor(container, options){
        super(container, tpl);
        this._initialized = false;
        this._options = options;
    }

    render() {
        if (this._initialized) return;
        this._initialized = true;

        this._imageBtn = this._container.find(".ws-tools-center-icon[role='add-image']");
        this._textBtn = this._container.find(".ws-tools-center-icon[role='add-text']");

        this._setEvents();
    }

    _setEvents() {
        this._setImageEvents();
        this._setTextEvents();
    }

    _setImageEvents() {
        this._imageBtn.draggable({
            helper: "clone",
            appendTo: this._options.mainContainer,
            zIndex: 10,
            scroll: false,
            start: (event, ui) => {
                $(ui.helper).addClass("focused");
            }
        });
    }

    _setTextEvents() {
        this._textBtn.draggable({
            helper: "clone",
            appendTo: this._options.mainContainer,
            zIndex: 10,
            scroll: false,
            start: (event, ui) => {
                $(ui.helper).addClass("focused");
            }
        });
    }
}
//}
//);
