import CWSPlayerElement from "./player-element"
import {makeEaseInOut, quad, animate} from './animate'

export default class CWSPlayerElementImage extends CWSPlayerElement {
    play() {
        if (!this._playState.stopped) return;
        super.play();

        this._playImage();
    }

    _playImage() {
        let rate = this._playState.rate;

        //assume now there can be only one effect
        let effects = this.Data.effects || [];
        if (effects.length == 0) return;
        let effect = effects[0];


        let imgDelay = 0;
        if (this._playState.position < effect.start) {
            imgDelay = (effect.start - this._playState.position) * 1000 / rate;
        }

        let that = this;

        (function (ef) {
            that._playState.imgDelayInterval = setTimeout(() => {
                let imgPlayPos = that._playState.position - ef.start;
                if (imgPlayPos < 0) imgPlayPos = 0;
                let item = $("#" + that.Id);
                let img = item.find("img");
                that._playState.imageAnimation = animate({
                    from: 0,
                    to: ef.acceleration * ef.duration,
                    curTime: imgPlayPos * 1000 / rate,
                    duration: ef.duration * 1000 / rate,
                    timing: makeEaseInOut(quad),
                    draw: (progress) => {
                        img.css({
                            width: (100 + progress) + "%",
                            height: (100 + progress) + "%"
                        })
                    }
                }, that._playState);
            }, imgDelay);
        })(effect);
    }

    _calcMaxSize() {
        let ass = this.Asset;

        if (!ass || !ass.info) {
            this._options.data.content.position.bottom = 0;
            this._options.data.content.position.right = 0;
            this._options.data.content.position.left = 0;
            this._options.data.content.position.top = 0;
        } else {
            let h = ass.info.size.height,
                w = ass.info.size.width;
            let pictRatio = w ? h / w : 1;
            w = 100;
            let actualWidth = 160; // * 1;
            let actualHeight = actualWidth * pictRatio;
            // calculate actualHeight's %
            h = actualHeight / 90 * 100;

            if (h > 100) {
                h = 100;
                actualHeight = 90; // * 1;
                actualWidth = actualHeight / pictRatio;
                w = actualWidth / 160 * 100;
            }
            if (!this._options.data.content.position)
                this._options.data.content.position = {};

            this._options.data.content.position.left = 50 - w / 2;
            this._options.data.content.position.right = 50 - w / 2;
            this._options.data.content.position.top = 50 - h / 2;
            this._options.data.content.position.bottom = 50 - h / 2;
        }
    }

    pause() {
        if (this._playState.stopped) return;

        super.pause();
        if (this._playState.imgDelayInterval) {
            clearTimeout(this._playState.imgDelayInterval);
            this._playState.imgDelayInterval = 0;
        }
    }

    stop() {
        if (this._playState.imgDelayInterval) {
            clearTimeout(this._playState.imgDelayInterval);
        }
        super.stop();
        this._playState.imgDelayInterval = 0

    }

    renderPosition(position) {
        super.renderPosition(position);
        let item = $("#" + this.Id);

        // масштаб изображения
        let effects = this.Data.effects;
        if (!effects) effects = [];
        if (effects.length != 0) {
            let effect = effects[0];
            let imgPlayPos = this._playState.position - effect.start;
            let offset = 0;
            if (imgPlayPos > 0
                && effect.duration > 0
                && imgPlayPos < this._playState.position - effect.start + effect.duration) {
                let timeFraction = imgPlayPos / effect.duration;
                if (timeFraction > 1) timeFraction = 1;
                let animationFunc = makeEaseInOut(quad);
                // текущее состояние анимации от 0 до 1
                let progress = animationFunc(timeFraction);
                // Текущее состояние в заказанных единицах
                let calcProgress = effect.acceleration * effect.duration * progress;

                offset = calcProgress / 2;
            }
            let img = item.find("img");
            img.css({
                left: (-offset) + "%",
                top: (-offset) + "%",
                width: (100 + offset * 2) + "%",
                height: (100 + offset * 2) + "%",
                transform: "none"
            });
        }
    }

    _initItem(item) {
        let ass = this.Asset;
        let cont = item.find(".ws-player-elem-content");

        if (ass) {
            this._options.loader
                .getAssetResources(ass.id)
                .then((assData) => {
                    let imgData = assData[0].file.body;
                    let imgDiv = $('<img src="' + imgData + '" />');

                    cont.html(imgDiv);

                    this._setEvents(item);
                    item.fadeIn("fast");

                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            let imgDiv = $('<img src="" />');
            cont.html(imgDiv);

            this._setEvents(item);
            item.fadeIn("fast");
        }
    }

    _reinitItem(item) {
        let ass = this.Asset;

        this._options.loader
            .getAssetResources(ass.id)
            .then((assData) => {
                let imgData = assData[0].file.body;
                if (!imgData) {
                    let cont = item.find(".ws-player-elem-content");
                    let imgDiv = cont.find("img");
                    imgDiv.attr("src", "");
                    imgDiv.css("display", "none");
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

}