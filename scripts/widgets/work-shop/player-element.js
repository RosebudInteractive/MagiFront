/**
 * Created by levan.kiknadze on 14/06/2017.
 */

define(
    ["./ws-base", 'text!./templates/work-shop.html'],
    function (CWSBase, tpl) {
        return class CWSPlayerElement extends CWSBase {
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

            setRate(rate) {
                if (this._playState.rate == +rate) return
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
                var rate = this._playState.rate;
                this._getItem();
                var data = this._options.data;
                this._playState.startedAt = new Date();
                this._playState.interval = setTimeout(() => {
                    this.stop();
                }, (data.content.duration - this._playState.position) * 1000 / rate);

                var ass = this.Asset
                if (ass && ass.info.type !== "text") this._playImage();
            }

            _playImage() {
                var rate = this._playState.rate;

                //assume now there can be only one effect
                var effects = this.Data.content.effects;
                if (effects.length == 0) return;
                var effect = effects[0];


                var imgDelay = 0;
                if (this._playState.position < effect.start) {
                    imgDelay = (effect.start - this._playState.position) * 1000 / rate;
                }

                var that = this;

                (function(ef) {
                    that._playState.imgDelayInterval = setTimeout(() => {
                        var imgPlayPos = that._playState.position - ef.start;
                        if (imgPlayPos < 0) imgPlayPos = 0;
                        var item = $("#" + that.Id);
                        var img = item.find("img");
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
                var item = $("#" + this.Id);
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
                var rate = this._playState.rate;
                if (this._playState.stopped) return;
                clearTimeout(this._playState.interval);
                this._playState.interval = null;
                var now = new Date();
                var position =
                    this._playState.position + (now - this._playState.startedAt)/1000 * rate;
                this._playState.position = position;
                if (this._playState.imgDelayInterval) {
                    clearTimeout(this._playState.imgDelayInterval);
                    this._playState.imgDelayInterval = null;
                }
                this._playState.stopped = true;
            }

            _getItem() {
                var item = $("#" + this.Id);
                var ass = this.Asset

                if (item.length == 0) {
                    var pos = this._options.data.content.position;
                    if (!pos) {
                        this._calcMaxSize()
                    }

                    var template = CWSPlayerElement.template("player-element");
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

                    var cont = item.find(".ws-player-elem-content");

                    if (ass) {
                        var imgDiv = null;
                        if (ass.info.type === 'text') {

                            var textToolsDiv = $('.ws-text-element-tools');
                            var textDiv = document.createElement('div');
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

                            var selectionchangeFn = (e) => {
                                var s = window.getSelection();
                                var oRange = s.getRangeAt(0);
                                var oRect = oRange.getBoundingClientRect();
                                $(textToolsDiv).css({'top': oRect.top - 30, 'left': oRect.right - $(textToolsDiv).width()/2 - oRect.width/2});

                                var parents = [];
                                var colors = [];
                                var parentEl = oRange.commonAncestorContainer;
                                var progress = true;

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

                            var overTools = false;

                            var mousemoveFn = (e) => {
                                var rect = $.extend({}, textDiv.getBoundingClientRect());
                                var rect2 = textToolsDiv[0].getBoundingClientRect();

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
                                var oRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
                                $(textToolsDiv).css({'top': oRect.top - 30, 'left': oRect.right - $(textToolsDiv).width()/2 - oRect.width/2});
                                $('.ws-text-element-tools-a').each((index, item) => {$(item).removeClass('ws-text-element-tools-a-selected');});
                                $('.ws-text-element-tools-a' + (this._options.data.data.currentSize + 1) ).addClass('ws-text-element-tools-a-selected')
                                return false
                            });

                            $(textDiv).html(resource.content);
                            textDiv._textTools.update();
                            cont.html(textDiv);

                        } else {
                            this._options.loader
                                .getAssetResources(ass.id)
                                .then((assData) => {
                                    var imgData = assData[0].file.body;
                                    var imgDiv = $('<img src="'+imgData+'" />');
                                    imgDiv.load(function() {
                                        var width = this.naturalWidth;
                                        var height = this.naturalHeight;
                                    });

                                    cont.html(imgDiv);

                                    this._setEvents(item);
                                    item.fadeIn( "fast" );
                                    console.log("El:" + this.Id + "fade");

                                })
                                .catch((err) => {
                                    console.error(err);
                                });

                        }
                    } else {
                        imgDiv = $('<img src="" />');
                        cont.html(imgDiv);

                        this._setEvents(item);
                        item.fadeIn( "fast" );
                    }

                } else {
                    this._options.loader
                        .getAssetResources(ass.id)
                        .then((assData) => {
                            var imgData = assData[0].file.body;
                            if (!imgData) {
                                var cont = item.find(".ws-player-elem-content");
                                var imgDiv = cont.find("img");
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
                var ass = this.Asset;
                var resource = null;
                if (ass) {
                    resource = ass.body;
                } else if (this._options.data.data) {
                    resource = this._options.data.data;
                }

                return resource;
            }

            _setResource(data) {
              var ass = this.Asset;
              var resource = null;
              if (ass) {
                  ass.body = data;
              } else if (this._options.data.data) {
                  this._options.data.data = data;
              }

              return resource;
            }

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

            _calcMaxSize() {
                var ass = this.Asset;

                if (!ass || !ass.info || ass.info.type === 'text') {
                    this._options.data.content.position.bottom = 0;
                    this._options.data.content.position.right = 0;
                    this._options.data.content.position.left = 0;
                    this._options.data.content.position.top = 0;
                } else {
                    var h = ass.info.size.height,
                        w = ass.info.size.width;
                    var pictRatio = w ? h / w : 1;
                    w = 100;
                    var actualWidth = 160 * 1;
                    var actualHeight = actualWidth * pictRatio;
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

            _recalcSize(event, ui) {
                var pixWidth = ui.size.width;
                var pixHeight = ui.size.height;

                var contWidth = this._container.width();
                var contHeight = this._container.height();

                var right = 0;
                var bottom = 0;
                var left = 0;
                var top = 0;

                if (contWidth > 0) {
                    right = (contWidth - ui.position.left - pixWidth)/contWidth * 100;
                    left = ui.position.left/contWidth * 100;
                }
                if (contHeight > 0) {
                    bottom = (contHeight - pixHeight - ui.position.top)/contHeight * 100;
                    top = ui.position.top/contHeight * 100;
                }

                this._options.data.position.bottom = bottom;
                this._options.data.position.right = right;
                this._options.data.position.left = left;
                this._options.data.position.top = top;
            }

            _recalcPosition(event, ui) {
                //this._options.data.position.left
                var pixLeft = ui.position.left;
                var pixTop = ui.position.top;

                var contWidth = this._container.width();
                var contHeight = this._container.height();

                var left = 0;
                var top = 0;
                if (contWidth > 0) left = pixLeft/contWidth * 100;
                if (contHeight > 0) top = pixTop/contHeight * 100;

                this._options.data.position.right =
                    this._options.data.position.right - (left - this._options.data.position.left);
                this._options.data.position.bottom =
                    this._options.data.position.bottom - (top - this._options.data.position.top);
                this._options.data.position.left = left;
                this._options.data.position.top = top;

            }

            _broadcastPosition() {
                if (this._options.onSetPosition)
                    this._options.onSetPosition({
                        trackElId: this._options.data.trackElement,
                        position: {
                            bottom: this._options.data.position.bottom,
                            right: this._options.data.position.right,
                            left: this._options.data.position.left,
                            top: this._options.data.position.top
                        }
                    });
            }

            _broadcastFocused() {
                if (this._options.onFocused)
                    this._options.onFocused({
                        trackElId: this._options.data.trackElement
                    });
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
                var item = this._getItem();
                this._playState.position = position - this.Start;

                //  масштаб изображения
                var effects = this.Data.effects;
                if (effects.length != 0){
                    var effect = effects[0];
                    var imgPlayPos = this._playState.position - effect.start;
                    var offset = 0;
                    if (imgPlayPos > 0) {
                        var timeFraction = imgPlayPos / effect.duration;
                        if (timeFraction > 1) timeFraction = 1;
                        var animationFunc = makeEaseInOut(quad);
                        // текущее состояние анимации от 0 до 1
                        var progress = animationFunc(timeFraction);
                        // Текущее состояние в заказанных единицах
                        var calcProgress = effect.acceleration * effect.duration * progress;

                        offset = calcProgress / 2;
                    }
                    var item = $("#" + this.Id);
                    var img = item.find("img");
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

            var start = performance.now();

            requestAnimationFrame(function animate(time) {
                // timeFraction от 0 до 1
                var timeFraction = (time - start + options.curTime) / options.duration;
                if (timeFraction > 1) timeFraction = 1;

                // текущее состояние анимации от 0 до 1
                var progress = options.timing(timeFraction);
                // Текущее состояние в заказанных единицах
                var calcProgress = options.from + options.to * progress;
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
            return function(timeFraction) {
                if (timeFraction < .5)
                    return timing(2 * timeFraction) / 2;
                else
                    return (2 - timing(2 * (1 - timeFraction))) / 2;
            }
        }

    }
);
