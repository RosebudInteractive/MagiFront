/**
 * Created by levan.kiknadze on 14/06/2017.
 */

import CWSBase from './ws-base';
import tpl from 'text!./templates/work-shop.html'

// define(
//     ["./ws-base", 'text!./templates/work-shop.html'],
//     function (CWSBase, tpl) {
export default class CWSPlayerElement extends CWSBase {
    constructor(container, options) {
        super(container, tpl);
        this._options = options;
        this._playState = {
            startedAt: null,
            stopped: true,
            position: 0,
            interval: 0
        }
    }

    get Id() {
        return this._options.data.id;
    }

    get Asset() {
        return this._options.data.asset;
    }

    set Asset(value) {
        this._options.data.asset = value;
    }

    get Start() {
        return this._options.data.start;
    }

    get Duration() {
        return this._options.data.content.duration;
    }

    get Position() {
        return this._playState.position;
    }

    set Position(value) {
        this._playState.position = value;
    }

    get Focused() {
        return this._options.data.focused;
    }

    set Focused(value) {
        this._options.data.focused = value;
    }

    get Data() {
        return $.extend(true, {}, this._options.data);
    }

    set Data(value) {
        this._options.data = value;
    }

    get DeleteOldTitles() {
        return this._options.data.content.deleteOldTitles === undefined || this._options.data.content.deleteOldTitles;
    }

    get Title() {
        return this._options.data.content.title;
    }

    get Title2() {
        return this._options.data.content.title2;
    }

    setRate(rate) {
        if (this._playState.rate == +rate) return;
        this._playState.rate = +rate;
        if (!this._playState.stopped) {
            this.pause();
            this.play();
        }
    }

    play() {
        if (!this._playState.stopped) return;
        this._playState.stopped = false;

        this._playState.rate = this._playState.rate || 1;
        let rate = this._playState.rate;
        this._getItem();
        let data = this._options.data;
        this._playState.startedAt = new Date();

        let _timeInterval = (data.content.duration - this._playState.position) * 1000 / rate

        this._playState.interval = setTimeout(() => {
            this.stop();
        }, _timeInterval);
    }

    stop() {
        let item = $("#" + this.Id);
        if (item.length != 0) {
            this._hide(item);
        }
        if (this._playState.stopped) return;

        if (this._playState.interval) {
            clearTimeout(this._playState.interval);
        }

        this._playState = {
            startedAt: null,
            stopped: true,
            position: 0,
            interval: 0,
        };
    }

    _hide(item) {
        item.fadeOut("fast", () => {
            item.remove();
        });
    }

    pause() {
        if (this._playState.stopped) return;
        let rate = this._playState.rate;
        if (this._playState.interval) {
            clearTimeout(this._playState.interval);
            this._playState.interval = 0;
        }

        let now = new Date();
        let position =
            this._playState.position + (now - this._playState.startedAt) / 1000 * rate;
        this._playState.position = position;
        this._playState.stopped = true;
    }

    _initItem(/*item*/) {

    }

    _reinitItem(/*item*/) {

    }

    _getItem() {
        let item = $("#" + this.Id);

        if (item.length == 0) {
            let pos = this._options.data.content.position;
            if (!pos) {
                this._calcMaxSize();
            }

            let template = CWSPlayerElement.template("player-element");
            item = $(template).attr("id", this.Id);
            item.css({
                left: this._options.data.content.position.left + "%",
                top: this._options.data.content.position.top + "%",
                bottom: this._options.data.content.position.bottom + "%",
                right: this._options.data.content.position.right + "%",
                "z-index": this._options.data.zIndex,
                display: "none"
            });

            this._container.append(item);

            this._initItem(item);
        } else {
            this._reinitItem(item);
        }

        if (this._options.data.focused) item.addClass("focused");
        else item.removeClass("focused");

        return item;
    }

    /*_getResource() {
        let ass = this.Asset;
        let resource = null;
        if (ass) {
            resource = ass.body;
        } else if (this._options.data.data) {
            resource = this._options.data.data;
        }

        return resource;
    }

    _setResource(data) {
        let ass = this.Asset;
        let resource = null;
        if (ass) {
            ass.body = data;
        } else if (this._options.data.data) {
            this._options.data.data = data;
        }

        return resource;
    }*/

    _setEvents() {
    }

    _calcMaxSize() {
    }

    renderPosition(position) {
        this._getItem();
        this._playState.position = position - this.Start;

        if (this._playState.stopped) return;
        clearTimeout(this._playState.interval);
        this._playState.interval = null;
        this._playState.stopped = true;
        this.play();
    }

    initContainer(cont) {
        this._container = cont;
        let item = $("#" + this.Id);
        if (item.length != 0) {
            item.parent().empty();
        }
    }
}

