/**
 * Created by levan.kiknadze on 13/06/2017.
 */
import CWSBase from './ws-base';
import Loader from './resource-loader';
import tpl from 'text!./templates/work-shop.html'
import Platform from 'platform';
import CWSPlayerElementImage from "work-shop/player-element-image";
import CWSPlayerElementText from "work-shop/player-element-text";

const ratioX = 16, ratioY = 9;

let _counter = 0;

export default class CWSPlayer extends CWSBase {
    constructor(container, options, audioOptions) {
        super(container, tpl);
        this._options = options;
        this._initDefaultOptions();
        this._validateOptions();
        this._audioState = {
            stopped: true,
            currentTime: (audioOptions && (audioOptions.currentTime !== undefined)) ? audioOptions.currentTime : 0,
            globalTime: 0,
            baseTime: 0,
            playingNow: {},
            volume: (audioOptions && (audioOptions.volume !== undefined)) ? audioOptions.volume : 0.3,
            muted: (audioOptions && (audioOptions.muted !== undefined)) ? audioOptions.muted : false,
            playbackRate: 1.0,
            requestAnimationFrameID: null,
            videoOff: false,
            source: null,
            currentTitles: [],
            id : ++_counter,
        };
        this._elements = {
            array: [],
            trackElIdx: {}
        };

        this._player = null;

        this._options.loader.setPosition(0);
    }

    initContainer(container) {
        super.initContainer(container, tpl);
        container.empty();
        this.render();

        this._reInitElements();
    }

    destroy() {
        this.pause();
        this._destroyAudioEvents(this._audioState.$audio);
        this._destroyEvents();
        this._options.loader.destroy();
        this.clear();
    }

    clear() {
        this._container.empty();
        this._elements = {
            array: [],
            trackElIdx: {}
        }
    }

    _reInitElements() {
        let cont = this._container.find(".ws-player-content");

        for (let i = 0; i < this._elements.array.length; i++) {
            let el = this._elements.array[i];
            el.initContainer(cont);
            if (el.Id in this._audioState.playingNow)
                el.renderPosition(this._audioState.globalTime);
            else
                el.stop();
        }
    }

    render() {
        let template = CWSPlayer.template("player");

        let item = this._container.children();
        if (item.length == 0) {
            item = $(template);
            this._container.append(item);
            this._setEvents();
            this._player = item;
        }

        this._setRatio(item);
    }

    setData(data) {
        let data2 = $.extend(true, {}, data);
        this._options.loader.setData(data2);

        this._audioState.globalTime = 0;
        this._audioState.currentTime = 0;

        this._prepareElements();

        if (data2.episodes.length > 0) {
            let episode = data2.episodes[0];
            this._audioState.currentEpisode = 0;
            this._options.loader
                .getAudioResource(episode.audio.file)
                .then((a) => {
                    let inf = $.extend(true, {}, episode.audio.info);
                    inf.data = a.data;
                    this._setAudio(inf);
                    if (this._audioState.audio.readyState >= 1) {
                        this._onAudioLoadedHandler(this._audioState.audio);
                    }

                    this._broadcastSetData(data2._nativeAppDataUuid);
                });

        }
    }

    _setEvents() {
        $(window).resize(this._onResize.bind(this));
    }

    _destroyEvents() {
        $(window).off("resize", this._onResize.bind(this))
    }

    _onResize() {
        this._setRatio(this._container.children());
    }

    _broadcastChangeContent(content) {
        if (this._options.onChangeContent) {
            this._options.onChangeContent($.extend(true, {}, content));
        }
    }

    _broadcastVolumeChanged(value){
        if (this._options.onVolumeChanged) {
            this._options.onVolumeChanged(value)
        }
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

        // if (item.parent()) {
        //     console.log(`${item.parent()[0].className} width: ${item.parent().width()} height: ${item.parent().height()}`)
        // }

        item.hide();
        let that = this;
        let contW = that._container.width();
        let contH = that._container.height();
        let contRatio = contW == 0 ? 0 : contH/contW;
        let playerRatio = that._options.ratioY/that._options.ratioX;
        item.show();

        if (contRatio == playerRatio) {
            item.height(contH);
            item.width(contW);
        } else if (contRatio < playerRatio) {
            item.height(contH);
            item.width(contH / playerRatio);

            // if (this._audioState.externalPlayer && item.parent()) {
            //     $(window).unbind("resize")
            //     item.parent().resize();
            //     $(window).bind("resize", ::this._onResize)
            // }
        } else {
            item.width(contW);
            item.height(contW * playerRatio);

            // if (this._audioState.externalPlayer && item.parent()) {
            //     $(window).unbind("resize")
            //     item.parent().resize();
            //     $(window).bind("resize", ::this._onResize)
            // }
        }

        $('.ws-text-element').each((index, element) => {
            //element._textTools.setRatio(contRatio);
            element._textTools.update();
        });
    }

    _setAudio(audio) {
        if (this._audioState.source && audio.data.id == this._audioState.source.data.id) return;
        if (!audio) {
            this._addDevWarn('_setAudio : No audio')
        } else {
            this._addDevInfo('_setAudio : audio ' + audio.data.body.src)
        }
        this._audioState.source = audio;

        this._initAudioTrack();
    }

    _initAudioTrack() {
        this._addDevInfo('_initAudioTrack')

        if (this._audioState.audio) {
            this._audioState.audio.pause();
            this._destroyAudioEvents(this._audioState.$audio);
        }

        if (!this._audioState.source) {
            this._audioState.audio = null;
            this._audioState.$audio = null;
            this._audioState.duration = 0;
        } else {
            try {
                let audio = this._audioState.source.data.body;
                this._addDevInfo('before pause')
                audio.pause();
                this._addDevInfo('before muted')
                audio.muted = this.getMute();
                this._addDevInfo('before currentTime');
                this._addDevInfo('ready state : ' + audio.readyState);


                this._addDevInfo('IOS - version');
                if (Platform.os.family === "iOS") {
                    // Данная установка необходима только для iOS, так как при переходе между аудио-эпизодами в
                    // лекции курсор не устанавливается в выбраное место нового (незагруженного) эпизода, а
                    // устанавливается в нулевую позицию и там остается.
                    // Данный костыль позволяет установить курсор в нужное место.
                    // Но если оставить для всех, то IE11 падает при этом.
                    audio.currentTime = 0;
                }

                this._addDevInfo('before audio')
                this._audioState.audio = audio;
                this._audioState.$audio = $(audio);
                this._addDevInfo('audio added')

                this._audioState.duration = audio.duration;
                this._audioState.currentTime = audio.currentTime;
                let data = this._options.loader.getData();
                let starts = this._options.loader.getEpisodesStartTimes();

                let startPos = starts[data.episodes[this._audioState.currentEpisode].id];
                this._audioState.globalTime = startPos.start + audio.currentTime;
                this._audioState.baseTime = startPos.start;
                audio.volume = this._audioState.volume;
                audio.playbackRate = this._audioState.playbackRate;

                this._setAudioEvents(this._audioState.$audio);
                this._options.loader.setPosition(this._audioState.globalTime);

                // this._broadcastAudioInitialized();
                // if ready state is greater, then onloaded event was already fired for the current element
                if (this._audioState.audio.readyState >= 2) {
                    if (!this._audioState.stopped) {
                        audio.play().then(() => {
                            this._addDevWarn('played!!!')
                        })
                    }
                    this._broadcastAudioLoaded();
                }
            } catch (e) {
                this._addDevErr(e.message)
                // console.log(e)
            }

        }
    }

    _destroyAudioEvents($audio) {
        if ($audio) {
            $audio.off("loadeddata")
                .off('volumechange')
                .off('timeupdate')
                .off('ended')
                .off('pause')
                .off('play')
                .off('error')
                .off("canplay")
                .off("progress")
                .off("seeked")
                .off("loadedmetadata")
                .off('waiting')
                .off('playing')
        }
    }

    _onAudioLoadedHandler(audio) {
        this._audioState.duration = audio.duration;
        this._audioState.currentTime = audio.currentTime;
        this._audioState.audio.volume = this._audioState.volume;
        this._audioState.audio.playbackRate = this._audioState.playbackRate;
        // that._audioState.audio.muted = that._audioState.muted;
        this._broadcastAudioLoaded();
        //that._options.loader.setPosition(0)
    }

    _setAudioEvents(audio) {
        let that = this;
        audio
            .on("canplay", function() {
                // console.log('canplay : ', this.src)
                that._addDevInfo('canplay')

                if (that._audioState.savedCurrenttime !== undefined) {
                    that._addDevWarn('canplay')
                    that._audioState.audio.currentTime = that._audioState.savedCurrenttime;
                    delete that._audioState.savedCurrenttime;
                }
                that._broadcastCanPlay(that);
            })
            .on("canplaythrough", () => {
                this._broadcastCanPlayThrough()
            })
            .on("loadeddata", function () {
                // console.log('loadeddata : ', this.src)
                that._onAudioLoadedHandler(this);
            })
            .on("timeupdate", function () {
                // console.log('timeupdate : ', this.src)
                that._audioState.currentTime = (that._audioState.currentTime < this.currentTime) ? this.currentTime : that._audioState.currentTime;
                that._audioState.globalTime = that._audioState.baseTime + that._audioState.currentTime;

                that._broadcastCurrentTimeChanged(true);
                //if (!that._audioState.stopped) {
                //    that._playElements(that._audioState.globalTime);
                //}
                //console.log("timeupdate", that._audioState.globalTime);
                that._options.loader.setPosition(that._audioState.globalTime)
                that._chechAndFireContentChanged();
            })
            .on("volumechange", function() {
                that._audioState.volume = this.volume;
                that._broadcastVolumeChanged(this.volume)
                that._audioState.muted = this.muted;
            })
            .on("ended", function () {
                // console.log('canplay ended : ', this.src)
                that._addDevInfo('canplay ended')
                let data = that._options.loader.getData();
                if (that._audioState.currentEpisode + 1 < data.episodes.length) {
                    let newTime = 0;
                    for (let i = 0; i <= that._audioState.currentEpisode; i++)
                        newTime += data.episodes[i].audio.info.length;
                    that.setPosition(newTime);
                    // that._audioState.currentEpisode++;
                    // let episode = data.episodes[that._audioState.currentEpisode];
                    // that._options.loader
                    //     .getAudioResource(episode.audio.file)
                    //     .then((a) => {
                    //         let inf = $.extend(true, {}, episode.audio.info);
                    //         inf.data = a.data;
                    //         that._setAudio(inf)
                    //         if (that._audioState.audio.readyState >= 1) {
                    //             that._onAudioLoadedHandler(that._audioState.audio);
                    //         }
                    //     });
                } else {
                    if (!that._audioState.stopped) {
                        that._audioState.stopped = true;
                        that._broadcastPaused();
                        that._broadcastCurrentTimeChanged(true);
                        that._broadcastEnded();
                    }
                }
            })
            .on("pause", function () {
                let data = that._options.loader.getData();
                if ((!this.ended) || ((that._audioState.currentEpisode + 1) >= data.episodes.length)) {
                    that._audioState.stopped = true;
                    that._broadcastPaused();
                }
                if (this.ended) {
                    that._broadcastCurrentTimeChanged(true);
                    that._broadcastEnded();
                }

            })
            .on("play", function () {
                that._onPlay()
            })
            .on("error", function (e) {
                // console.log('canplay error')
                that._addDevInfo('canplay error')
                that.pause();
                that._broadcastError(e);
            })
            .on("progress", function() {
                // console.log('progress : ', this.src)
                that._calcBuffered(this)
            })
            .on("loadedmetadata", function() {
                // console.log('loadedmetadata : ', this.src)
                that._calcBuffered(this)
            })
            .on('waiting', () => {
                this._broadcastWaiting()
            })
            .on('playing', () => {
                this._broadcastPlaying()
            })
            .on('abort', () => {
                this._broadcastAbort()
            })
            .on('stalled', () => {
                this._broadcastStalled()
            })
            .on('suspend', () => {
                this._broadcastSuspend()
            })
    }

    _onPlay() {
        this._audioState.stopped = false;
        this._audioState.requestAnimationFrameID = requestAnimationFrame(::this._proccessAnimationFrame);
        this._broadcastStarted();
    }

    _calcBuffered(player) {
        let _bufferedLength = player.buffered.length;
        let _time = _bufferedLength ? (this._audioState.baseTime + player.buffered.end(_bufferedLength - 1)) : 0;

        this._broadcastBuffered(_time)
    }

    _chechAndFireContentChanged() {
        let episodesContent = this.getLectureContent();
        let curCont = null;
        for (let i = 0; i < episodesContent.length; i++) {
            let epContent = episodesContent[i].content;
            for (let j = 0; j < epContent.length; j++) {
                let epCont = epContent[j];
                if (epCont.begin <= this._audioState.globalTime) {
                    curCont = epCont;
                }
            }
        }

        if (!curCont && !this._audioState.currentContent) return;

        if ((curCont && !this._audioState.currentContent) ||
            (!curCont && this._audioState.currentContent)
        ) {
            this._audioState.currentContent = curCont;
            this._broadcastChangeContent(curCont);
        } else if (this._audioState.currentContent.title != curCont.title ||
            this._audioState.currentContent.begin != curCont.begin) {
            this._audioState.currentContent = curCont;
            this._broadcastChangeContent(curCont);
        }
    }

    _playElements(position) {
        let newtitles = [];
        let deleteOld = false;
        let rate = +(this._audioState.playbackRate || 1);
        for (let i = 0; i < this._elements.array.length; i++) {
            let el = this._elements.array[i];
            if (position >= el.Start && position < (el.Start + el.Duration)) {
                el.setRate(rate);
                el.play();
                if (this._audioState.playingNow[el.Id] === undefined) {
                    if (el.DeleteOldTitles === undefined || el.DeleteOldTitles) {
                        deleteOld = true;
                    }
                    if (el.Title || el.Title2)
                        newtitles.push({id: el.Id, title: el.Title, title2: el.Title2})
                }
                this._audioState.playingNow[el.Id] = el;
            } else if (el.Id in this._audioState.playingNow) {
                el.stop();
                delete this._audioState.playingNow[el.Id];
            }
        }

        let changed = this._recalcTitles(newtitles, deleteOld);
        if (changed)
            this._broadcastChangeTitles();
    }

    _recalcTitles(newTitles, deleteOld) {
        let changed = false;
        if (deleteOld || newTitles.length > 0) {
            for (let i = 0; i < this._audioState.currentTitles.length; ) {
                if (!(this._audioState.currentTitles[i].id in this._audioState.playingNow)) {
                    this._audioState.currentTitles.splice(i, 1);
                    changed = true;
                } else {
                    i++
                }
            }
        }

        for (let i = 0; i < newTitles.length; i++) {
            let nt = newTitles[i];
            let found = false;
            for (let j = 0; j < this._audioState.currentTitles.length; j++) {
                let ot = this._audioState.currentTitles[j];
                if (ot.id == nt.id) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                this._audioState.currentTitles.push(nt);
                changed = true;
            }
        }
        return changed || newTitles.length > 0;
    }

    _broadcastAudioLoaded() {
        if (this._options.onAudioLoaded)
            this._options.onAudioLoaded(this.getAudioState());
    }

    //_broadcastAudioInitialized() {
    //    if (this._options.onAudioInitialized)
    //        this._options.onAudioInitialized(this.getAudioState());
    //}

    _broadcastCurrentTimeChanged(value) {
        if (this._options.onCurrentTimeChanged)
            this._options.onCurrentTimeChanged(this.getAudioState(), value);
    }

    _broadcastCanPlay(e) {
        if (this._options.onCanPlay) {
            this._options.onCanPlay(e)
        }
    }

    _broadcastCanPlayThrough() {
        if (this._options.onCanPlayThrough) {
            this._options.onCanPlayThrough()
        }
    }

    _broadcastPaused() {
        if (this._options.onPaused)
            this._options.onPaused();
    }

    _broadcastStarted() {
        if (this._options.onStarted)
            this._options.onStarted();
    }

    _broadcastEnded() {
        if (this._options.onEnded)
            this._options.onEnded();
    }

    _broadcastError(e) {
        if (this._options.onError)
            this._options.onError(e);
    }

    _broadcastBuffered(value) {
        if (this._options.onBuffered) {
            this._options.onBuffered(value)
        }
    }

    _broadcastSetPosition(value) {
        if (this._options.onSetPosition) {
            this._options.onSetPosition(value)
        }
    }

    _broadcastSetData(value) {
        if (this._options.onSetData) {
            this._options.onSetData(value)
        }
    }

    _broadcastWaiting() {
        if (this._options.onWaiting) {
            this._options.onWaiting()
        }
    }

    _broadcastPlaying() {
        if (this._options.onPlaying) {
            this._options.onPlaying()
        }
    }

    _broadcastAbort() {
        if (this._options.onAbort) {
            this._options.onAbort()
        }
    }

    _broadcastStalled() {
        if (this._options.onStalled) {
            this._options.onStalled()
        }
    }

    _broadcastSuspend() {
        if (this._options.onSuspend) {
            this._options.onSuspend()
        }
    }

    _broadcastMessage(message) {
        if (this._options.onMessage) {
            this._options.onMessage(message)
        }
    }

    getAudioState() {
        let result = $.extend(true, {}, this._audioState);
        return result;
    }

    _proccessAnimationFrame() {
        if (this._audioState.audio) {
            this._audioState.currentTime = (this._audioState.currentTime < this._audioState.audio.currentTime) ? this._audioState.audio.currentTime : this._audioState.currentTime;
            this._audioState.globalTime = this._audioState.baseTime + this._audioState.currentTime;
            this._broadcastCurrentTimeChanged();
            if (!this._audioState.stopped) {
                this._playElements(this._audioState.globalTime);
            }
        }

        if (!this._audioState.stopped) {
            this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
        }
    }

    clearSource() {
        // this.audio.data.src = ''
    }

    play() {
        return new Promise((resolve) => {
            if (!this._audioState.audio) {
                this._addDevErr('No audio!!!');
                resolve();
                return
            }

            if (this._audioState.stopped) {
                resolve(this._audioState.audio.play());
            } else {
                resolve();
            }
        })
    }

    pause() {
        let that = this;
        let tmInt = null;
        return new Promise((resolve, reject) => {
            if (!that._audioState.stopped) {
                that._audioState.$audio.on("pause", awaitPlayerPause);
                that._audioState.audio.pause();
                tmInt = setTimeout(function () {
                    if (that._audioState.audio.paused) {
                        that._audioState.stopped = true;
                        resolve();
                    } else {
                        reject();
                    }
                }, 500)
            }

            if (that._audioState.stopped) {
                setTimeout(() => {
                    resolve();
                }, 0)
            }

            cancelAnimationFrame(that._audioState.requestAnimationFrameID);
            that._pauseElements();

            function awaitPlayerPause() {
                clearTimeout(tmInt);
                that._audioState.$audio.off("pause", awaitPlayerPause);
                that._audioState.stopped = true;
                resolve();
            }
        });

    }

    /* from 0.1 to 1 */
    setVolume(volume) {
        if (this._audioState.audio.volume == volume) return;
        let oldVol = +this._audioState.audio.volume;
        this._audioState.volume = volume;
        let volDiff = volume - oldVol;
        let part = volDiff / 300;
        let start = performance.now();

        let that = this;
        requestAnimationFrame(function _changeVolumeCallback(time) {
            let diffTime = time - start;
            if (diffTime > 300) {
                that._audioState.audio.volume = volume;

                return
            }

            let newVol = oldVol + part * diffTime;
            if (newVol < 0) newVol = 0;
            if (newVol > 1) newVol = 1;

            that._audioState.audio.volume = newVol;
            requestAnimationFrame(_changeVolumeCallback);
        });
    }


    setRate(rate) {
        this._audioState.audio.playbackRate = +rate;
        this._audioState.playbackRate = +rate;
        for (let i in this._audioState.playingNow) {
            if (!this._audioState.playingNow.hasOwnProperty(i)) continue;
            let el = this._audioState.playingNow[i];
            el.setRate(+rate);
        }
    }

    setMute(value) {
        this._audioState.muted = !!value;
        this._audioState.audio.muted = !!value;
    }

    toggleMute() {
        this._audioState.muted = !this._audioState.muted;
        this._audioState.audio.muted = this._audioState.muted;
    }

    getMute() {
        return this._audioState.muted;
    }

    _addDevInfo(text) {
        let _dev = $('#dev'),
            isVisible = _dev.is(':visible');

        if (isVisible === true) {
            _dev.append($( "<div style='position:  relative'>" + text + "</div>" ))
        }
    }

    _addDevWarn(text) {
        let _dev = $('#dev'),
            isVisible = _dev.is(':visible');

        if (isVisible === true) {
            _dev.append($('<div style="position:  relative; color:navajowhite">' + text + '</div>'))
        }
    }

    _addDevErr(text) {
        let _dev = $('#dev'),
            isVisible = _dev.is(':visible');

        if (isVisible === true) {
            _dev.append($('<div style="position:  relative; color:red">' + text + '</div>'))
        }
    }

    setPosition(position) {
        let starts = this._options.loader.getEpisodesStartTimes();
        let maxEnd = 0;
        let newStart = null;
        for (let id in starts) {
            let s = starts[id];
            if (s.end > maxEnd) {
                maxEnd = s.end;
            }

            if (position >= s.start && position <= s.end) {
                newStart = s;
            }
        }

        if (position >=0 && position <= maxEnd) {
            let data = this._options.loader.getData();
            let epIdx = 0;
            for (let i = 0; i < data.episodes.length; i++) {
                if (data.episodes[i].id == newStart.episode.id) {
                    epIdx = i;
                    break;
                }
            }

            this._audioState.baseTime = newStart.start;
            this._audioState.currentTime = position - newStart.start;
            this._audioState.globalTime = this._audioState.baseTime + this._audioState.currentTime;

            if (this._audioState.currentEpisode != epIdx) {
                this._audioState.currentEpisode = epIdx;
                // this._audioState.audio.pause();
                this._destroyAudioEvents(this._audioState.$audio);

                this._options.loader.setPosition(position);
                this._options.loader.disableChangePosition();
                let savedState = $.extend(true, {}, this._audioState);
                this._addDevWarn('--- MEGA BEFORE ---')
                this._addDevInfo('current time: ' + savedState.currentTime);
                this._options.loader
                    .getAudioResource(newStart.episode.audio.file)
                    .then((a) => {
                        let inf = $.extend(true, {}, newStart.episode.audio.info);
                        inf.data = a.data;
                        this._audioState.currentEpisode = epIdx;

                        this._audioState.audio.pause();
                        this._audioState.stopped = true;

                        this._setAudio(inf);

                        this._addDevInfo('ready state: ' + this._audioState.audio.readyState);
                        if (this._audioState.audio.readyState > 0) {
                            this._audioState.audio.currentTime = savedState.currentTime;
                        } else {
                            if (Platform.name === 'IE') {
                                this._addDevWarn('add listener');
                                this._audioState.savedCurrenttime = savedState.currentTime;
                            }
                            this._addDevWarn('ready state: ' + this._audioState.audio.readyState);
                        }

                        this._addDevErr('BEFORE PROGRESS')
                        this._addDevInfo('current time: ' + this._audioState.audio.currentTime);
                        this._addDevInfo('saved current time: ' + savedState.currentTime);

                        let _func = () => {
                            this._addDevErr('----- PROGRESS START -----')
                            this._addDevInfo('seeking : ' + this._audioState.audio.seeking)

                            if (this._audioState.audio.seeking) {
                                this._addDevErr('----- PROGRESS FINISH -----')
                                return
                            }

                            this._audioState.$audio.off('progress', _func)

                            this._addDevInfo('current time: ' + this._audioState.audio.currentTime);
                            this._addDevInfo('saved current time: ' + savedState.currentTime);
                            this._addDevWarn('setPosition internal')

                            this._audioState.audio.currentTime = savedState.currentTime;

                            if (this._audioState.audio.paused) {
                                this._audioState.audio.play()
                            }
                            this._addDevErr('----- PROGRESS FINISH -----')
                        }

                        let _func2 = () => {
                            this._addDevErr('----- SEEKED START -----')
                            this._audioState.$audio.off('seeked', _func2)
                            this._addDevInfo('current time: ' + this._audioState.audio.currentTime);
                            this._addDevInfo('saved current time: ' + savedState.currentTime);

                            if (this._audioState.audio.paused) {
                                this._audioState.audio.play()
                            }

                            this._broadcastSetPosition(this._audioState)

                            this._addDevErr('----- SEEKED FINISH -----')
                        }

                        this._audioState.$audio.on('progress', _func)
                        this._audioState.$audio.on('seeked', _func2)
                        this._audioState.currentEpisode = epIdx;
                        this._audioState.globalTime = savedState.globalTime;
                        this._audioState.currentTime = savedState.currentTime;
                        this._audioState.baseTime = savedState.baseTime;

                        if (this._audioState.audio.readyState >= 1) {
                            this._onAudioLoadedHandler(this._audioState.audio);
                        }

                        this._setElementsPosition(position);
                        this._playElements(position);
                        if (this._audioState.stopped) this._pauseElements();
                        this._options.loader.enableChangePosition();
                    })
                    .catch((err) => {
                        this._addDevErr('setPosition error ' + err.message)
                        // console.error('setPosition', err)
                        this._options.loader.enableChangePosition();
                        if (!this._audioState.stopped)
                            this._audioState.audio.play();
                        // console.error(err);
                    });
            } else {
                this._options.loader.setPosition(position);
                this._audioState.audio.currentTime = this._audioState.currentTime;
                this._setElementsPosition(position);

                this._broadcastSetPosition(this._audioState)
            }
        }
    }

    getPosition() {
        return this._audioState.globalTime;
    }

    getStopped() {
        return this._audioState.stopped;
    }

    getCurrent() {
        let result = [];

        for (let id in this._audioState.playingNow) {
            let obj = {};
            let el = this._audioState.playingNow[id];
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
        let data = this._options.loader.getData();
        let result = [];
        let epStarts = this._options.loader.getEpisodesStartTimes();

        for (let i = 0; i < data.episodes.length; i++) {
            let episode = data.episodes[i];
            let epContent = {
                title: episode.title,
                duration: episode.audio.info.length,
                duration_formated: episode.audio.info.length_formatted,
                content: []
            };

            let cont = episode.contents;
            let epStart = epStarts[episode.id];
            for (let j = 0; j < cont.length; j++) {
                let resCont = $.extend(true, {}, cont[j]);
                resCont.begin += epStart.start;
                epContent.content.push(resCont);
            }

            result.push(epContent);
        }

        return result;
    }

    _pauseElements() {
        for (let i in this._audioState.playingNow) {
            let el = this._audioState.playingNow[i];
            el.pause();
        }
    }

    _setElementsPosition(position) {
        let newTitles = [];
        let deleteOld = false;
        for (let i = 0; i < this._elements.array.length; i++) {
            let el = this._elements.array[i];
            if (position >= el.Start && position < (el.Start + el.Duration)) {
                el.Position = position - el.Start;

                if (this._audioState.playingNow[el.Id] === undefined) {
                    if (el.DeleteOldTitles === undefined || el.DeleteOldTitles) {
                        deleteOld = true;
                    }
                    if (el.Title || el.Title2) {
                        newTitles.push({id: el.Id, title: el.Title, title2: el.Title2})
                    }
                }

                this._audioState.playingNow[el.Id] = el;
                el.renderPosition(position);
            } else {
                if (el.Id in this._audioState.playingNow) {
                    delete this._audioState.playingNow[el.Id];
                    el.stop();
                }
                el.Position = 0;
            }
        }

        let changed = this._recalcTitles(newTitles, deleteOld);
        if (changed)
            this._broadcastChangeTitles();
    }

    _broadcastChangeTitles() {
        if (this._options.onChangeTitles) {
            this._options.onChangeTitles(this._audioState.currentTitles);
        }
    }

    _prepareElements() {
        let data = this._options.loader.getData();
        let assets = [];
        let elemsIdx = {};
        let cont = this._container.find(".ws-player-content");

        // Удалим элементы плеера, которые относятся к уже не существующим элементам трека
        this._deleteUnusedElements(data);

        for (let epIdx = 0; epIdx < data.episodes.length; epIdx++) {
            let episode = data.episodes[epIdx];
            for (let i = 0; i < episode.tracks.length; i++) {
                let track = episode.tracks[i];
                for (let j = 0; j < track.elements.length; j++) {
                    let elData = this._decodeElData(track.elements[j], i + 1);
                    let elem = null;
                    if (elData.trackElement in this._elements.trackElIdx) {
                        elem = this._elements.trackElIdx[elData.trackElement];
                        elem.Data = elData;
                    } else {
                        let elOptions = this._getElementOptions(elData);
                        let ElConstructor = this._getElementConstructor(elData);
                        elem = new ElConstructor(cont, elOptions);
                        elem.setEventsHandler({onPlay: this._options.onElementPlay, onStop: this._options.onElementStop})
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

    static _getResource(elData) {
        let ass = elData.asset;
        let resource = null;
        if (ass) {
            resource = ass.body;
        } else if (elData.data) {
            resource = elData.data;
        }

        return resource;
    }

    _deleteUnusedElements(data) {
        let newElArray = [];
        let newElIdx = {};
        for (let i = 0; i < this._elements.array.length; i++) {
            let el = this._elements.array[i];
            let elData = el.Data;
            let trackElId = elData.trackElement;
            if (CWSPlayer._isElementDeleted(data, trackElId)) {
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

    static _isElementDeleted(lecture, trackElId) {
        for (let epIdx = 0; epIdx < lecture.episodes.length; epIdx++) {
            let data = lecture.episodes[epIdx];
            for (let i = 0; i < data.tracks.length; i++) {
                let track = data.tracks[i];
                for (let j = 0; j < track.elements.length; j++) {
                    if (track.elements[j].id == trackElId) return false;
                }
            }
        }
        return true;
    }

    _getElementOptions(elData) {
        return {
            data: elData,
            designMode: this._options.designMode,
            loader: this._options.loader
        }
    }

    _decodeElData(trackElData, zIndex) {
        let oldData = null;
        if (trackElData.id in this._elements.trackElIdx) {
            oldData = this._elements.trackElIdx[trackElData.id].Data;
            if (trackElData.content.position) {
                oldData.content.position = {
                    left: trackElData.content.position.left,
                    top: trackElData.content.position.top,
                    bottom: trackElData.content.position.bottom,
                    right: trackElData.content.position.right
                };
            }
            oldData.content.duration = trackElData.content.duration;
            oldData.zIndex = zIndex;
            oldData.focused = trackElData.focused;
            oldData.data = trackElData.data;
            oldData.effects = $.extend(true, [], trackElData.effects || []);
            oldData.content.title = trackElData.content.title;
            oldData.content.title2 = trackElData.content.title2;
            oldData.content.deleteOldTitles =
                trackElData.content.deleteOldTitles === undefined || trackElData.content.deleteOldTitles;
            oldData.start = trackElData.start;
        } else {
            oldData = $.extend(true, {}, trackElData);
            oldData.id = Utils.guid();
            oldData.trackElement = trackElData.id;
            oldData.zIndex = zIndex;
        }

        if (trackElData.assetId) {
            oldData.asset = $.extend(true, {}, this._getAsset(trackElData.assetId));
        } else
            oldData.asset = null;

        oldData.effects = oldData.effects || [];

        return oldData;

    }

    _getAsset(id) {
        return this._options.loader.getAsset(id);
    }

    renderPosition(position) {
        if (position !== undefined && position != null)
            this.setPosition(position);

        for (let i = 0; i < this._elements.array.length; i++) {
            let el = this._elements.array[i];
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

    _getElementConstructor(data) {
        let type = CWSPlayer._getElementType(data);
        switch (type) {
            case "text": return CWSPlayerElementText;
            case "image": return CWSPlayerElementImage;
        }
    }

    static _getElementType(data) {
        if (data && data.asset) {
            if (data.asset.info["mime-type"] === undefined ||
                (data.asset.info["mime-type"] && data.asset.info["mime-type"].startsWith("image")))
                return "image";
            else
                return "text";
        } else if (data.data) {
            if (data.data.type && data.data.type == "text") return "text";
            else return "image";
        } else
            return "image";

    }

}
//    }
//);
