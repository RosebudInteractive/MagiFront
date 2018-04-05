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
        console.log("El:" + this.Id + "luanched");
        this._playState.stopped = false;

        this._playState.rate = this._playState.rate || 1;
        let rate = this._playState.rate;
        this._getItem();
        let data = this._options.data;
        this._playState.startedAt = new Date();
        this._playState.interval = setTimeout(() => {
            this.stop();
        }, (data.content.duration - this._playState.position) * 1000 / rate);

        let ass = this.Asset
        if (ass && ass.info.type !== "text") this._playImage();
    }

    _playImage() {
        let rate = this._playState.rate;

        //assume now there can be only one effect
        let effects = this.Data.content.effects;
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

    stop() {
        let item = $("#" + this.Id);
        if (item.length != 0) {
            this._hide(item);
        }
        if (this._playState.stopped) return;

        clearTimeout(this._playState.interval);
        if (this._playState.imgDelayInterval) {
            clearTimeout(this._playState.imgDelayInterval);
        }
        this._playState = {
            startedAt: null,
            stopped: true,
            position: 0,
            interval: 0,
            imgDelayInterval: null
        };
    }

    _hide(item) {
        item.fadeOut("fast", () => {
            item.remove();
        });
    }

    pause() {
        let rate = this._playState.rate;
        if (this._playState.stopped) return;
        clearTimeout(this._playState.interval);
        this._playState.interval = null;
        let now = new Date();
        let position =
            this._playState.position + (now - this._playState.startedAt) / 1000 * rate;
        this._playState.position = position;
        if (this._playState.imgDelayInterval) {
            clearTimeout(this._playState.imgDelayInterval);
            this._playState.imgDelayInterval = null;
        }
        this._playState.stopped = true;
    }

            _getItem() {
                let item = $("#" + this.Id);
                let ass = this.Asset

                if (item.length == 0) {
                    let pos = this._options.data.content.position;
                    if (!pos) {
                        this._calcMaxSize()
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

            let cont = item.find(".ws-player-elem-content");

                    if (ass) {
                        let imgDiv = null;
                        if (ass.info.type === 'text') {

                    let textToolsDiv = $('.ws-text-element-tools');
                    let textDiv = document.createElement('div');
                    textDiv.classList.add('ws-text-element');
                    textDiv.id = Utils.guid();

                    textDiv.contentEditable = "false";

                    textDiv._textTools = {
                        setRatio: (ratio) => {
                            setTimeout(() => {
                                this._options.data.data.ratio = ratio;
                                this._broadcastSetTextData();
                                textDiv._textTools.update();
                            }, 50)
                        },
                        setCurrentSize: (size) => {
                            setTimeout(() => {
                                this._options.data.data.currentSize = size;
                                this._broadcastSetTextData();
                                textDiv._textTools.update();
                            }, 50)
                        },
                        update: () => {
                            textDiv.style.fontSize = (this._options.data.data.sizes[this._options.data.data.currentSize] * this._options.data.data.ratio) + 'px';
                        }
                    }

                    let selectionchangeFn = (e) => {
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
                                    parents.push(parentEl)
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
                    }

                    let overTools = false;

                    let mousemoveFn = (e) => {
                        let rect = $.extend({}, textDiv.getBoundingClientRect());
                        let rect2 = textToolsDiv[0].getBoundingClientRect();

                        if (rect.left <= e.clientX && rect.right >= e.clientX && rect.top <= e.clientY && rect.bottom >= e.clientY ||
                            rect2.left <= e.clientX && rect2.right >= e.clientX && rect2.top <= e.clientY && rect2.bottom >= e.clientY) {
                            overTools = true
                        } else overTools = false;
                    }

                    textDiv.addEventListener('mouseleave', (e) => {
                        setTimeout(() => {
                            if (!overTools) {
                                textDiv.contentEditable = "false";
                                $(textToolsDiv).removeClass('ws-text-element-tools-show');
                                if (item.hasClass('ui-draggable')) item.draggable('enable');
                                document.removeEventListener('mousemove', mousemoveFn);
                                document.removeEventListener("selectionchange", selectionchangeFn);
                            }
                        }, 100);
                    });

                    textDiv.addEventListener('blur', (e) => {
                        setTimeout(() => {
                            this._options.data.data.content = $(textDiv).html();
                            this._broadcastSetTextData();
                        }, 50);
                    });

                    textDiv.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        window.textId = textDiv.id;
                        textDiv.contentEditable = "true"
                        item.draggable('disable');
                        textDiv.focus();
                        $(textToolsDiv).addClass('ws-text-element-tools-show');
                        document.addEventListener('mousemove', mousemoveFn);
                        document.addEventListener("selectionchange", selectionchangeFn);
                        let oRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
                        $(textToolsDiv).css({
                            'top': oRect.top - 30,
                            'left': oRect.right - $(textToolsDiv).width() / 2 - oRect.width / 2
                        });
                        $('.ws-text-element-tools-a').each((index, item) => {
                            $(item).removeClass('ws-text-element-tools-a-selected');
                        });
                        $('.ws-text-element-tools-a' + (this._options.data.data.currentSize + 1)).addClass('ws-text-element-tools-a-selected')
                        return false
                    });

                    $(textDiv).html(resource.content);
                    textDiv._textTools.update();
                    cont.html(textDiv);

                } else {
                    this._options.loader
                        .getAssetResources(ass.id)
                        .then((assData) => {
                            let imgData = assData[0].file.body;
                            let imgDiv = $('<img src="' + imgData + '" />');
                            imgDiv.on('load', () => {
                                let width = this.naturalWidth;
                                let height = this.naturalHeight;
                            });

                            cont.html(imgDiv);

                            this._setEvents(item);
                            item.fadeIn("fast");
                            console.log("El:" + this.Id + "fade");

                        })
                        .catch((err) => {
                            console.error(err);
                        });

                }
            } else {
                let imgDiv = $('<img src="" />');
                cont.html(imgDiv);

                this._setEvents(item);
                item.fadeIn("fast");
            }

                } else {
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

        if (this._options.data.focused) item.addClass("focused");
        else item.removeClass("focused");

        return item;
    }

    _getResource() {
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
    }

            _setEvents() {
            }

    _calcMaxSize() {
        let ass = this.Asset;

                if (!ass || !ass.info || ass.info.type === 'text') {
                    this._options.data.content.position.bottom = 0;
                    this._options.data.content.position.right = 0;
                    this._options.data.content.position.left = 0;
                    this._options.data.content.position.top = 0;
                } else {
                    let h = ass.info.size.height,
                        w = ass.info.size.width;
                    let pictRatio = w ? h / w : 1;
                    w = 100;
                    let actualWidth = 160 * 1;
                    let actualHeight = actualWidth * pictRatio;
                    // calculate actualHeight's %
                    h = actualHeight / 90 * 100;

            if (h > 100) {
                h = 100;
                actualHeight = 90 * 1;
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

            _broadcastSetTextData() {
              if (this._options.onSetTextData) {
                  this._options.onSetTextData({
                    trackElId: this._options.data.trackElement,
                    data: this._options.data.data
                  })
              }
            }

    renderPosition(position) {
        let item = this._getItem();
        this._playState.position = position - this.Start;

                //  масштаб изображения
                let effects = this.Data.effects;
                if (!effects) effects = [];
                if (effects.length != 0){
                    let effect = effects[0];
                    let imgPlayPos = this._playState.position - effect.start;
                    let offset = 0;
                    if (imgPlayPos > 0) {
                        let timeFraction = imgPlayPos / effect.duration;
                        if (timeFraction > 1) timeFraction = 1;
                        let animationFunc = makeEaseInOut(quad);
                        // текущее состояние анимации от 0 до 1
                        let progress = animationFunc(timeFraction);
                        // Текущее состояние в заказанных единицах
                        let calcProgress = effect.acceleration * effect.duration * progress;

                offset = calcProgress / 2;
            }
            let item = $("#" + this.Id);
            let img = item.find("img");
            img.css({
                left: (-offset) + "%",
                top: (-offset) + "%",
                width: (100 + offset * 2) + "%",
                height: (100 + offset * 2) + "%"
            });
        }

        if (this._playState.stopped) return;
        clearTimeout(this._playState.interval);
        this._playState.interval = null;
        this._playState.stopped = true;
        this.play();
    }

}

/**
 *
 * @param options {}
 */
function animate(options, playState) {

    let start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        let timeFraction = (time - start + options.curTime) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // текущее состояние анимации от 0 до 1
        let progress = options.timing(timeFraction);
        // Текущее состояние в заказанных единицах
        let calcProgress = options.from + options.to * progress;
        options.draw(calcProgress);

        if (timeFraction < 1 && !playState.stopped) {
            requestAnimationFrame(animate);
        }

    });
}

function imageTimingFunc(timeFraction) {
    return timeFraction;
}

function quad(progress) {
    return Math.pow(progress, 3);
}

function makeEaseInOut(timing) {
    return function (timeFraction) {
        if (timeFraction < .5)
            return timing(2 * timeFraction) / 2;
        else
            return (2 - timing(2 * (1 - timeFraction))) / 2;
    }
}

// }
// );
