/**
 * Created by levan.kiknadze on 13/06/2017.
 */

define(
    ["./ws-base", './player-element', './resource-loader', 'text!./templates/work-shop.html'],
    function (CWSBase, CPlayerElement, Loader, tpl) {
        const ratioX = 16, ratioY = 9;

        function compareElements(a,b) {
            if (a.start < b.start)
                return -1;
            if (a.start > b.start)
                return 1;
            return 0;
        }

        return class CWSPlayer extends CWSBase {
            constructor(container, options){
                super(container, tpl);
                this._options = options;
                this._initDefaultOptions();
                this._validateOptions();
                this._audioState = {
                    stopped: true,
                    currentTime: 0,
                    globalTime: 0,
                    baseTime: 0,
                    playingNow: {},
                    volume: 0.3,
                    muted: false,
                    playbackRate: '1.0',
                    requestAnimationFrameID: null,
                    videoOff: false,
                    source: null
                };
                this._elements = {
                    array: [],
                    trackElIdx: {}
                };

                this._player = null;

                this._options.loader.setPosition(0);

                this._setTextToolsEvents();
            }

            render() {
                var template = CWSPlayer.template("player");

                var item = this._container.children();
                if (item.length == 0) {
                    item = $(template);
                    this._container.append(item);
                    this._setEvents(item);
                    this._player = item;
                }

                this._setRatio(item);
            }

            setData(data) {
                var data2 = $.extend(true, {}, data)
                this._options.loader.setData(data2);
                this._prepareElements();

                var audioId = null;
                if (data2.episodes.length > 0) {
                    var episode = data2.episodes[0];
                    this._audioState.currentEpisode = 0;
                    this._options.loader
                        .getAudioResource(episode.audio.file)
                        .then((a) => {
                            var inf = $.extend(true, {}, episode.audio.info);
                            inf.data = a.data;
                            this._setAudio(inf)
                        });

                }

            }

            _setEvents(item) {
                $(window).resize(() => {
                    this._setRatio(item);
                });

                var cont = item.children(".ws-player-content");
                cont.droppable({
                    tolerance: "touch",
                    accept: (el) => {
                        var accept = el.hasClass("ws-assets-item");
                        accept = accept && this._findFreeSpace();
                        return accept;
                    },
                    drop: ( event, ui ) => {
                        var freeTrackId = this._findFreeSpace();
                        if (ui.draggable.hasClass("ws-assets-item") && freeTrackId)
                            this._onDropAsset(freeTrackId, ui);
                    }
                });
            }

            _findTrack(id) {
                var tracks = this._tracksList;
                var track = null;
                for (var i = 0; i < tracks.length; i++) {
                    var cur = tracks[i];
                    if (cur.id == id) {
                        track = cur;
                        break;
                    }
                }

                return track;
            }

            _onDropAsset(trackId, ui) {
                var hOffset = ui.helper.offset();
                var track = this._findTrack(trackId);

                var startTime = this._audioState.currentTime;
                var assData = ui.draggable.data("data");
                // player ratio is 16:9
                // if player width = 160, then 30% is
                var w = 30;
                var actualWidth = 160 * (w / 100);
                var pictRatio = assData.size.height / assData.size.width;
                var actualHeight = actualWidth * pictRatio;
                // calculate actualHeight's %
                var h = actualHeight / 90 * 100;

                var cont = this._container.find(".ws-player-content");
                var contOffset = cont.offset();
                var cw = cont.width();
                var ch = cont.height();
                var l = (hOffset.left - contOffset.left) / cw * 100,
                    t = (hOffset.top - contOffset.top) / ch * 100,
                    r = 100 - l - w,
                    b = 100 - t - h;
                if (b < 0) {
                    t += b;
                    b = 0;
                }
                if (r < 0) {
                    l += r;
                    r = 0;
                }


                var element = {
                    id: Utils.guid(),
                    asset: {id: ui.draggable.attr("id"), body: null},
                    start: startTime,
                    duration: 5,
                    position: {
                        left: l,
                        top: t,
                        right: r,
                        bottom: b
                    },
                    effects:[
                        {"type": "zoom", "start": 0, "duration": 0, "acceleration": 0}
                    ]
                };
                track.elements.push(element);
                if (this._correctElementsIntersection(track, element, false))
                    this._broadcastAddElement(trackId, track.elements);
            }

            _correctElementsIntersection(track, editedData, shift) {
                var audioState = this._audioState;

                var elements = [];
                for (var i = 0; i < track.elements.length; i++) {
                    if (track.elements[i].id == editedData.id)
                        elements.push(editedData);
                    else
                        elements.push($.extend(true, {}, track.elements[i]));
                }

                elements = elements.sort(compareElements);

                var currentPos = 0;
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    var oldStart = element.start;

                    if (currentPos > element.start) {
                        element.start = currentPos;
                    }
                    // если не зажат Shift, то пытаемся ужать следующий элемент
                    if (!shift && oldStart != element.start) {
                        var delta = element.start - oldStart;
                        element.duration -= delta;
                        if (element.duration < 1) element.duration = 1;
                    }

                    currentPos = element.start + element.duration;
                }
                var last = elements[elements.length - 1];
                if (last.start + last.duration > audioState.duration) {
                    return false;
                }

                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    for (var j = 0; j < track.elements.length; j++) {
                        if (track.elements[j].id == el.id) {
                            var tEl = track.elements[j];
                            tEl.start = el.start;
                            tEl.duration = el.duration;
                            break;
                        }
                    }
                }
                track.elements = track.elements.sort(compareElements);
                return true;
            }

            _broadcastAddElement(trackId, elements) {
                if (this._options.onAddElement) {
                    this._options.onAddElement({track: trackId, elements: elements});
                }
            }

            _findFreeSpace() {
                var pos = this._audioState.currentTime;
                var pNow = this._audioState.playingNow;
                var trackId = null;

                for (var i = 0; i < this._tracksList.length; i++) {
                    var track = this._tracksList[i];
                    var trackIsFree = true;
                    for (var j = 0; j < track.elements.length; j++) {
                        var el = track.elements[j];
                        if (el.start <= pos && pos <= el.start + el.duration) {
                            trackIsFree = false;
                            break;
                        }
                    }
                    if (trackIsFree) {
                        trackId = track.id;
                        break;
                    }
                }

                return trackId;
            }

            _initDefaultOptions() {
                this._options = this._options || {};
                this._options.ratioX = this._options.ratioX || ratioX;
                this._options.ratioY = this._options.ratioY || ratioY;
                this._options.designMode = this._options.designMode || false;
                this._options.playMode =
                    this._options.playMode === undefined ? 2 : this._options.playMode;
            }

            _setRatio(item) {
                // console.log(window.textId);
                var contW = this._container.width();
                var contH = this._container.height();
                var contRatio = contW == 0 ? 0 : contH/contW;
                var playerRatio = this._options.ratioY/this._options.ratioX;
                // console.log(fontSize);

                item.css({height: null, width: null});//, fontSize: fontSize + 'px'});

                if (contRatio == playerRatio) {
                    item.height(contH);
                    item.width(contW);
                } else if (contRatio < playerRatio) {
                    item.height(contH);
                    item.width(contH/playerRatio);
                } else {
                    item.width(contW);
                    item.height(contW*playerRatio);
                }

                $('.ws-text-element').each((index, element) => {
                  element._textTools.setRatio(contRatio);
                  element._textTools.update();
                })
            }

            _setAudio(audio) {
                if (this._audioState.source && audio.data.id == this._audioState.source.data.id) return;
                this._audioState.source = audio;
                this._initAudioTrack();
            }

            _initAudioTrack() {
                if (this._audioState.audio) {
                    this._audioState.audio.pause();
                    this._destroyAudioEvents(this._audioState.$audio);
                }

                if (!this._audioState.source) {
                    this._audioState.audio = null;
                    this._audioState.$audio = null;
                    this._audioState.duration = 0;
                } else {
                    var audio = this._audioState.source.data.body;
                    audio.pause();
                    audio.muted = this.getMute();
                    audio.currentTime = 0;
                    //this.currentTime = 0;`
                    this._audioState.audio = audio;
                    this._audioState.$audio = $(audio);

                    this._audioState.duration = audio.duration;
                    this._audioState.currentTime = audio.currentTime;
                    var data = this._options.loader.getData();
                    var starts = this._options.loader.getEpisodesStartTimes();

                    var startPos = starts[data.episodes[this._audioState.currentEpisode].id];
                    this._audioState.globalTime = startPos.start;
                    this._audioState.baseTime = startPos.start;
                    audio.volume = this._audioState.volume;
                    audio.playbackRate = this._audioState.playbackRate;

                    this._setAudioEvents(this._audioState.$audio);
                    this._options.loader.setPosition(this._audioState.globalTime);
                    if (!this._audioState.stopped) audio.play();
                    //this._audioState.audio.load();
                }
            }

            _destroyAudioEvents($audio) {
                $audio.off("loadeddata")
                    .off('volumechange')
                    .off('timeupdate')
                    .off('ended');
            }

            _setAudioEvents(audio) {
                var that = this;
                audio.on("loadeddata", function () {
                    that._audioState.duration = this.duration;
                    that._audioState.currentTime = this.currentTime;
                    that._audioState.audio.volume = that._audioState.volume;
                    that._audioState.audio.playbackRate = that._audioState.playbackRate;
                    // that._audioState.audio.muted = that._audioState.muted;
                    that._broadcastAudioLoaded();
                    //that._options.loader.setPosition(0)
                }).on("timeupdate", function (e) {
                    that._audioState.currentTime = this.currentTime;
                    that._audioState.globalTime = that._audioState.baseTime + this.currentTime;
                    that._broadcastCurrentTimeChanged();
                    if (!that._audioState.stopped) {
                        that._playElements(that._audioState.globalTime);
                    }
                    console.log("timeupdate", that._audioState.globalTime);
                    that._options.loader.setPosition(that._audioState.globalTime)

                }).on("volumechange", function(e) {
                    that._audioState.volume = this.volume;
                }).on("ended", function () {
                    var data = that._options.loader.getData();
                    if (that._audioState.currentEpisode + 1 < data.episodes.length) {
                        that._audioState.currentEpisode++;
                        var episode = data.episodes[that._audioState.currentEpisode];
                        that._options.loader
                            .getAudioResource(episode.audio.file)
                            .then((a) => {
                                var inf = $.extend(true, {}, episode.audio.info);
                                inf.data = a.data;
                                that._setAudio(inf)
                            });
                    }
                });

            }

            _playElements(position) {
                var rate = +(this._audioState.playbackRate || 1);
                for (var i = 0; i < this._elements.array.length; i++) {
                    var el = this._elements.array[i];
                    if (position >= el.Start && position <= (el.Start + el.Duration)) {
                        el.setRate(rate);
                        el.play();
                        this._audioState.playingNow[el.Id] = el;
                    } else if (el.Id in this._audioState.playingNow) {
                        el.stop();
                        delete this._audioState.playingNow[el.Id];
                    }
                }
            }

            _broadcastAudioLoaded() {
                if (this._options.onAudioLoaded)
                    this._options.onAudioLoaded(this.getAudioState());
            }

            _broadcastCurrentTimeChanged() {
                if (this._options.onCurrentTimeChanged)
                    this._options.onCurrentTimeChanged(this.getAudioState());
            }

            getAudioState() {
                var result = $.extend(true, {}, this._audioState);
                return result;
            }

            _proccessAnimationFrame(timestamp) {
              this._audioState.currentTime = this._audioState.audio.currentTime;
              this._audioState.globalTime =  this._audioState.baseTime + this._audioState.currentTime;
              this._broadcastCurrentTimeChanged();
              if (!this._audioState.stopped) {
                  this._playElements(this._audioState.globalTime);
              }
              // console.log(this._audioState.audio.currentTime);
              this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
            }

            play() {
                this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
                if (this._audioState.stopped) this._audioState.audio.play();
                this._audioState.stopped = false;
            }

            pause() {
                if (!this._audioState.stopped) this._audioState.audio.pause();
                this._audioState.stopped = true;
                cancelAnimationFrame(this._audioState.requestAnimationFrameID);
                this._pauseElements();
            }

            /* from 0.1 to 1 */
            setVolume(volume) {
              this._audioState.audio.volume = volume;
              this._audioState.volume = volume;
            }

            setRate(rate) {
                this._audioState.audio.playbackRate = +rate;
                this._audioState.playbackRate = +rate;
                for (var i in this._audioState.playingNow) {
                    var el = this._audioState.playingNow[i];
                    el.setRate(+rate);
                }
            }

            setMute(value) {
                this._audioState.muted = !!value;
                this._audioState.audio.muted = !!value;
                console.log(this._audioState.muted);
            }

            toggleMute() {
              this._audioState.muted = !this._audioState.muted
              this._audioState.audio.muted = this._audioState.muted;
            }

            getMute() {
              return this._audioState.muted;
            }

            setPosition(position) {
                var starts = this._options.loader.getEpisodesStartTimes();
                var maxEnd = 0;
                var newStart = null;
                for (var id in starts) {
                    var s = starts[id];
                    if (s.end > maxEnd) {
                        maxEnd = s.end;
                    }

                    if (position >= s.start && position <= s.end) {
                        newStart = s;
                    }
                }

                if (position >=0 && position <= maxEnd) {
                    var data = this._options.loader.getData();
                    var epIdx = 0;
                    for (var i = 0; i < data.episodes.length; i++) {
                        if (data.episodes[i].id == newStart.episode.id) {
                            epIdx = i;
                            break;
                        }
                    }

                    this._audioState.baseTime = newStart.start;
                    this._audioState.currentTime = position - newStart.start;
                    this._audioState.globalTime = position;

                    if (this._audioState.currentEpisode != epIdx) {
                        this._audioState.currentEpisode = epIdx;
                        this._audioState.audio.pause();
                        this._options.loader.setPosition(position);
                        this._options.loader.disableChangePosition();
                        console.log("Set position 1", this._audioState)
                        var savedState = $.extend(true, {}, this._audioState);
                        this._options.loader
                            .getAudioResource(newStart.episode.audio.file)
                            .then((a) => {
                                var inf = $.extend(true, {}, newStart.episode.audio.info);
                                inf.data = a.data;
                                this._audioState.currentEpisode = epIdx;

                                console.log("Set position 2", this._audioState)
                                this._setAudio(inf)

                                this._audioState.audio.currentTime = savedState.currentTime;
                                this._audioState.currentEpisode = epIdx;
                                this._audioState.globalTime = savedState.globalTime;
                                this._audioState.currentTime = savedState.currentTime;
                                this._audioState.baseTime = savedState.baseTime;

                                console.log("Set position 3", this._audioState)
                                this._setElementsPosition(position);
                                this._playElements(position);
                                if (this._audioState.stopped) this._pauseElements();
                                this._options.loader.enableChangePosition();
                            })
                            .catch((err) => {
                                this._options.loader.enableChangePosition();
                                if (!this._audioState.stopped)
                                    this._audioState.audio.play();
                                console.error(err);
                            });
                    } else {
                        this._options.loader.setPosition(position);
                        this._audioState.audio.currentTime = this._audioState.currentTime;
                        this._setElementsPosition(position);
                        this._playElements(position)
                    }
                }
            }

            getPosition() {
                return this._audioState.audio.globalTime;
            }

            getStopped () {
                return this._audioState.stopped;
            }

            getCurrent() {
                var result = [];

                for (var id in this._audioState.playingNow) {
                    var obj = {};
                    var el = this._audioState.playingNow[id];
                    obj.id = el.Data.id;
                    if (el.Data.asset) {
                        obj.asset = {
                            id: el.Data.asset.id,
                            title: el.Data.asset.body.title
                        }
                    }

                    result.push(obj);
                }

                return result;
            }

            setVideoOff() {
                if (this._audioState.videoOff) return;

                this._audioState.videoOff = true;
                this._container.children().hide();
            }

            setVideoOn() {
                if (!this._audioState.videoOff) return;

                this._audioState.videoOff = false;
                this._container.children().show();
            }

            /**
             * 0 - small images
             * 1 - medium images
             * 2 - large (normal) images
             */
            setPlayMode(mode) {
                mode = +mode;
                if (mode < 0 || mode > 2) return;
                if (this._options.playMode != mode) {
                    this._options.playMode = mode;
                    // TODO change loader mode
                }
            }

            getLectureContent() {
                var data = this._options.loader.getData();
                var result = [];
                var epStarts = this._options.loader.getEpisodesStartTimes();

                for (var i = 0; i < data.episodes.length; i++) {
                    var episode = data.episodes[i];
                    var epContent = {
                        title: episode.title,
                        duration: episode.audio.info.length,
                        duration_formated: episode.audio.info.length_formatted,
                        content: []
                    }

                    var cont = episode.contents;
                    var epStart = epStarts[episode.id];
                    for (var j = 0; j < cont.length; j++) {
                        var resCont = $.extend(true, {}, cont[j]);
                        resCont.begin += epStart.start;
                        epContent.content.push(resCont);
                    }

                    result.push(epContent);
                }

                return result;
            }

            _pauseElements() {
                for (var i in this._audioState.playingNow) {
                    var el = this._audioState.playingNow[i];
                    el.pause();
                }
            }

            _setElementsPosition(position) {
                for (var i = 0; i < this._elements.array.length; i++) {
                    var el = this._elements.array[i];
                    if (position >= el.Start && position <= (el.Start + el.Duration)) {
                        var localPosition = position - el.Start;
                        el.Position = localPosition;
                        this._audioState.playingNow[el.Id] = el;
                    } else {
                        if (el.Id in this._audioState.playingNow) {
                            delete this._audioState.playingNow[el.Id];
                            el.stop();
                        }
                        el.Position = 0;
                    }
                }
            }

            _setTextToolsEvents() {

              console.log('_setTextToolsEvents')

              var textToolsDiv = $('.ws-text-element-tools');

              $('.ws-text-element-tools-a1').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                var textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
                var ratio = this._container.height() / this._container.width();
                console.log('?');
                textDiv._textTools.setCurrentSize(0);
                textDiv._textTools.setRatio(ratio);
                textDiv._textTools.update();
                $('.ws-text-element-tools-a').each((index, item) => {$(item).removeClass('ws-text-element-tools-a-selected');});
                $(e.target).addClass('ws-text-element-tools-a-selected')
                this._setRatio(this._player);
              });

              $('.ws-text-element-tools-a2').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                var textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
                var ratio = this._container.height() / this._container.width();
                textDiv._textTools.setCurrentSize(1);
                textDiv._textTools.setRatio(ratio);
                textDiv._textTools.update();
                $('.ws-text-element-tools-a').each((index, item) => {$(item).removeClass('ws-text-element-tools-a-selected');});
                $(e.target).addClass('ws-text-element-tools-a-selected')
                this._setRatio(this._player);
              });

              $('.ws-text-element-tools-a3').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                var textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
                var ratio = this._container.height() / this._container.width();
                textDiv._textTools.setCurrentSize(2);
                textDiv._textTools.setRatio(ratio);
                textDiv._textTools.update();
                $('.ws-text-element-tools-a').each((index, item) => {$(item).removeClass('ws-text-element-tools-a-selected');});
                $(e.target).addClass('ws-text-element-tools-a-selected')
                this._setRatio(this._player);
              });

              $('.ws-text-element-tools-i').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + window.textId).focus();
                document.execCommand('Italic', false, null);
              });

              $('.ws-text-element-tools-i').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + window.textId).focus();
                document.execCommand('Italic', false, null);
              });

              $('.ws-text-element-tools-b').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + window.textId).focus();
                document.execCommand('Bold', false, null);
              });

              $('.ws-text-element-tools-ol').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + window.textId).focus();
                document.execCommand('insertUnorderedList', false, null);
              });

              var clEl = $('.ws-text-element-tools-color');
              if (clEl.length > 0) {
                  clEl[0].controls = {
                      setColor: (color) => {
                          var clEl = $('.ws-text-element-tools-color');
                          clEl[0].style.backgroundColor = color;
                          clEl[0].style.borderColor = color;
                      },
                  }
              }
              $('.ws-text-element-tools-color').on('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('#' + window.textId).focus();
                // console.log(getComputedStyle($('.ws-text-element-tools-color')[0]).backgroundColor);

                document.execCommand('hiliteColor', false, getComputedStyle($('.ws-text-element-tools-color')[0]).backgroundColor);
              });
              $('.ws-text-element-tools-color').on('mouseheld', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                // console.log('color held')
                // console.log($('.ws-text-element-tools-color')[0].controls.setColor('#F00'));
                $('.ws-text-element-tools-color-pal').css({'display': 'block'});
              });
              $('.ws-text-element-tools-color-pal').on('mouseleave', (e) => {
                $('.ws-text-element-tools-color-pal').css({'display': 'none'});
              });
              $('.ws-text-element-tools-color-item').each((index, value) => {
                $(value).on('click', () => {
                    var clEl = $('.ws-text-element-tools-color');
                    clEl[0].controls.setColor( getComputedStyle($(value)[0]).backgroundColor );
                    $('.ws-text-element-tools-color-item').each((index, item) => {
                    $(item).removeClass('ws-text-element-tools-color-selected');
                  });
                  $(value).addClass('ws-text-element-tools-color-selected');
                });
              })
            }

            _prepareElements() {
                var data = this._options.loader.getData();
                var assets = [];
                var elemsIdx = {};
                var cont = this._container.find(".ws-player-content");

                // Удалим элементы плеера, которые относятся к уже не существующим элементам трека
                this._deleteUnusedElements(data);

                var starts = this._options.loader.getEpisodesStartTimes();

                for (var epIdx = 0; epIdx < data.episodes.length; epIdx++) {
                    var episode = data.episodes[epIdx];
                    for (var i = 0; i < episode.tracks.length; i++) {
                        var track = episode.tracks[i];
                        for (var j = 0; j < track.elements.length; j++) {
                            var elData = this._decodeElData(track.elements[j], i + 1, starts[episode.id].start);
                            var elem = null;
                            if (elData.trackElement in this._elements.trackElIdx) {
                                elem = this._elements.trackElIdx[elData.trackElement];
                                elem.Data = elData;
                            } else {
                                var elOptions = this._getElementOptions(elData);
                                elem = new CPlayerElement(cont, elOptions);

                                this._elements.trackElIdx[elData.trackElement] = elem;
                                this._elements.array.push(elem);
                            }

                            if (!track.elements[j].assetId) continue;

                            assets.push(track.elements[j].assetId);
                            // Какому элементу какой ассет
                            elemsIdx[elem.Id] = track.elements[j].assetId;
                        }
                    }
                }
            }

            _getResource(elData) {
                var ass = elData.asset;
                var resource = null;
                if (ass) {
                    resource = ass.body;
                } else if (elData.data) {
                    resource = elData.data;
                }

                return resource;
            }

            _deleteUnusedElements(data) {
                var newElArray = [];
                var newElIdx = {};
                for (var i = 0; i < this._elements.array.length; i++) {
                    var el = this._elements.array[i];
                    var elData = el.Data;
                    var trackElId = elData.trackElement;
                    if (this._isElementDeleted(data, trackElId)) {
                        el.stop();
                        if (el.Id in this._audioState.playingNow)
                            delete this._audioState.playingNow[el.Id];
                    } else {
                        newElArray.push(el);
                        newElIdx[elData.trackElement] = el;
                    }
                }

                this._elements.array = newElArray;
                this._elements.trackElIdx = newElIdx;
            }

            _isElementDeleted(lecture, trackElId) {
                for (var epIdx = 0; epIdx < lecture.episodes.length; epIdx++) {
                    var data = lecture.episodes[epIdx];
                    for (var i = 0; i < data.length; i++) {
                        var track = data.tracks[i];
                        for (var j = 0; j < track.elements.length; j++) {
                            if (track.elements[j].id == trackElId) return false;
                        }
                    }
                }
                return true;
            }

            _getElementOptions(elData) {
                var that = this;
                return {
                    data: elData,
                    designMode: this._options.designMode,
                    loader: this._options.loader,
                    onSetPosition: function (e) {
                        if (that._options.onSetPosition) that._options.onSetPosition(e);
                    },
                    onFocused: function (e) {
                        for (var i = 0; i < that._elements.array.length; i++) {
                            var el = that._elements.array[i];
                            if (el.Id != elData.id) el.Focused = false;
                        }
                        that.renderPosition(null);
                        if (that._options.onFocused) that._options.onFocused(e);
                    },
                    onSetTextData: function (e) {
                      for (var i = 0; i < that._elements.array.length; i++) {
                          var el = that._elements.array[i];
                          if (el.Data.trackElement == e.trackElId) {
                            // elData.data = e.data
                            if (that._options.onSetTextData) that._options.onSetTextData(e);
                          }
                      }

                    }
                }
            }

            _decodeElData(trackElData, zIndex, episodeStart) {
                var oldData = null;
                if (trackElData.id in this._elements.trackElIdx) {
                    oldData = this._elements.trackElIdx[trackElData.id].Data;
                    oldData.content.position = {
                        left: trackElData.content.position.left,
                        top: trackElData.content.position.top,
                        bottom: trackElData.content.position.bottom,
                        right: trackElData.content.position.right
                    };
                    oldData.content.duration = trackElData.duration;
                    //oldData.start = episodeStart + trackElData.start;
                    oldData.zIndex = zIndex;
                    oldData.focused = trackElData.focused;
                    oldData.data = trackElData.data;
                    oldData.content.effects = $.extend(true, {}, trackElData.content.effects);
                } else {
                    oldData = $.extend(true, {}, trackElData);
                    oldData.id = Utils.guid();
                    oldData.trackElement = trackElData.id;
                    //oldData.start = episodeStart + trackElData.start
                    oldData.zIndex = zIndex;
                }

                if (trackElData.assetId) {
                    oldData.asset = $.extend(true, {}, this._getAsset(trackElData.assetId));
                } else
                    oldData.asset = null;

                oldData.content.effects = oldData.content.effects || [];

                return oldData;

            }

            _getAsset(id) {
                return this._options.loader.getAsset(id);
            }

            renderPosition(position) {
                if (position !== undefined && position != null)
                    this.setPosition(position);

                for (var i = 0; i < this._elements.array.length; i++) {
                    var el = this._elements.array[i];
                    if (el.Id in this._audioState.playingNow)
                        el.renderPosition(this._audioState.globalTime);
                    else
                        el.stop();
                }
            }

            _validateOptions() {
                if (!this._options.loader) {
                    this._options.loader = new Loader();
                }
            }
        }
    }
);
