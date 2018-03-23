/**
 * Created by levan.kiknadze on 13/06/2017.
 */
import CWSBase from './ws-base';
import CPlayerElement from './player-element';
import Loader from './resource-loader';
import tpl from 'text!./templates/work-shop.html'

// define(
//     ["./ws-base", './player-element', './resource-loader', 'text!./templates/work-shop.html'],
//     function (CWSBase, CPlayerElement, Loader, tpl) {
const ratioX = 16, ratioY = 9;

export default class CWSPlayer extends CWSBase {
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
            playbackRate: 1,
            requestAnimationFrameID: null,
            videoOff: false,
            source: null,
            currentTitles: []
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
    }

    render() {
        let template = CWSPlayer.template("player");

        let item = this._container.children();
        if (item.length == 0) {
            item = $(template);
            this._container.append(item);
            this._setEvents(item);
            this._player = item;
        }

        this._setRatio(item);
    }

    setData(data) {
        let data2 = $.extend(true, {}, data);
        this._options.loader.setData(data2);
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
                });

        }

    }

    _setEvents(item) {
        $(window).resize(() => {
            this._setRatio(item);
        });

    }

    _broadcastChangeContent(content) {
        if (this._options.onChangeContent) {
            this._options.onChangeContent($.extend(true, {}, content));
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
        // console.log(window.textId);
        let contW = this._container.width();
        let contH = this._container.height();
        let contRatio = contW == 0 ? 0 : contH/contW;
        let playerRatio = this._options.ratioY/this._options.ratioX;
        // console.log(fontSize);

        item.css({height: null, width: null});//, fontSize: fontSize + 'px'});

        if (contRatio == playerRatio) {
            item.height(contH);
            item.width(contW);
        } else if (contRatio < playerRatio) {
            item.height(contH);
            item.width(contH / playerRatio);
        } else {
            item.width(contW);
            item.height(contW * playerRatio);
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
            let audio = this._audioState.source.data.body;
            audio.pause();
            audio.muted = this.getMute();
            audio.currentTime = 0;
            //this.currentTime = 0;`
            this._audioState.audio = audio;
            this._audioState.$audio = $(audio);

            this._audioState.duration = audio.duration;
            this._audioState.currentTime = audio.currentTime;
            let data = this._options.loader.getData();
            let starts = this._options.loader.getEpisodesStartTimes();

            let startPos = starts[data.episodes[this._audioState.currentEpisode].id];
            this._audioState.globalTime = startPos.start;
            this._audioState.baseTime = startPos.start;
            audio.volume = this._audioState.volume;
            audio.playbackRate = this._audioState.playbackRate;

            this._setAudioEvents(this._audioState.$audio);
            this._options.loader.setPosition(this._audioState.globalTime);
            if (!this._audioState.stopped) audio.play();
            //this._audioState.audio.load();
            this._broadcastAudioInitialized()
        }
    }

    _destroyAudioEvents($audio) {
        $audio.off("loadeddata")
            .off('volumechange')
            .off('timeupdate')
            .off('ended');
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
        audio.on("loadeddata", function () {
            that._onAudioLoadedHandler(this);
        }).on("timeupdate", function () {
            that._audioState.currentTime = this.currentTime;
            that._audioState.globalTime = that._audioState.baseTime + this.currentTime;
            that._broadcastCurrentTimeChanged();
            //if (!that._audioState.stopped) {
            //    that._playElements(that._audioState.globalTime);
            //}
            //console.log("timeupdate", that._audioState.globalTime);
            that._options.loader.setPosition(that._audioState.globalTime)
            that._chechAndFireContentChanged();
        }).on("volumechange", function() {
            that._audioState.volume = this.volume;
        }).on("ended", function () {
            let data = that._options.loader.getData();
            if (that._audioState.currentEpisode + 1 < data.episodes.length) {
                that._audioState.currentEpisode++;
                let episode = data.episodes[that._audioState.currentEpisode];
                that._options.loader
                    .getAudioResource(episode.audio.file)
                    .then((a) => {
                        let inf = $.extend(true, {}, episode.audio.info);
                        inf.data = a.data;
                        that._setAudio(inf)
                        if (this._audioState.audio.readyState >= 1) {
                            this._onAudioLoadedHandler(this._audioState.audio);
                        }
                    });
            }
        }).on("pause", function () {
            that.pause();
            that._broadcastPaused();
        }).on("play", function () {
            that.play();
            that._broadcastStarted();
        }).on("error", function (e) {
            that.pause();
            that._broadcastError(e);
        });

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
            if (position >= el.Start && position <= (el.Start + el.Duration)) {
                el.setRate(rate);
                el.play();
                if (this._audioState.playingNow[el.Id] === undefined) {
                    if (el.DeleteOldTitles === undefined && el.DeleteOldTitles) {
                        deleteOld = true;
                    }
                    if (el.Title)
                        newtitles.push({id: el.Id, title: el.Title})
                }
                this._audioState.playingNow[el.Id] = el;
            } else if (el.Id in this._audioState.playingNow) {
                el.stop();
                delete this._audioState.playingNow[el.Id];
            }
        }

        this._recalcTitles(newtitles, deleteOld);
        this._broadcastChangeTitles();
    }

    _recalcTitles(newTitles, deleteOld) {
        if (deleteOld || newTitles.length > 0) {
            for (let i = 0; i < this._audioState.currentTitles.length; ) {
                if (!(this._audioState.currentTitles[i].id in this._audioState.playingNow)) {
                    this._audioState.currentTitles.splice(i, 1);
                } else {
                    i++
                }
            }
        }

        this._audioState.currentTitles.push(...newTitles)
    }

    _broadcastAudioLoaded() {
        if (this._options.onAudioLoaded)
            this._options.onAudioLoaded(this.getAudioState());
    }

    _broadcastAudioInitialized() {
        if (this._options.onAudioInitialized)
            this._options.onAudioInitialized(this.getAudioState());
    }

    _broadcastCurrentTimeChanged() {
        if (this._options.onCurrentTimeChanged)
            this._options.onCurrentTimeChanged(this.getAudioState());
    }

    _broadcastPaused() {
        if (this._options.onPaused)
            this._options.onPaused();
    }

    _broadcastStarted() {
        if (this._options.onStarted)
            this._options.onStarted();
    }

    _broadcastError(e) {
        if (this._options.onError)
            this._options.onError();
    }

    getAudioState() {
        let result = $.extend(true, {}, this._audioState);
        return result;
    }

    _proccessAnimationFrame() {
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
        let that = this;
        let tmInt = null;
        return new Promise((resolve, reject) => {
            this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
            if (this._audioState.stopped) {
                this._audioState.$audio.on("play", awaitPlayerPlay);
                this._audioState.audio.play();
                tmInt = setTimeout(function () {
                    if (that._audioState.audio.paused) {
                        this._audioState.stopped = false;
                        resolve();
                    } else {
                        reject();
                    }
                }, 500)
            }

            if (this._audioState.stopped) {
                setTimeout(() => {
                    resolve();
                }, 0)
            }



            function awaitPlayerPlay() {
                clearInterval(tmInt);
                that._audioState.$audio.off("play", awaitPlayerPlay);
                that._audioState.stopped = false;
                resolve();
            }
        });
    }

    pause() {
        let that = this;
        let tmInt = null;
        return new Promise((resolve, reject) => {
            if (!this._audioState.stopped) {
                this._audioState.$audio.on("pause", awaitPlayerPause);
                this._audioState.audio.pause();
                tmInt = setTimeout(function () {
                    if (that._audioState.audio.paused) {
                        this._audioState.stopped = true;
                        resolve();
                    } else {
                        reject();
                    }
                }, 500)
            }
            if (this._audioState.stopped) {
                setTimeout(() => {
                    resolve();
                }, 0)
            }

            cancelAnimationFrame(this._audioState.requestAnimationFrameID);
            this._pauseElements();

            function awaitPlayerPause() {
                clearInterval(tmInt);
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

        let that = this;
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
        console.log(this._audioState.muted);
    }

    toggleMute() {
        this._audioState.muted = !this._audioState.muted;
        this._audioState.audio.muted = this._audioState.muted;
    }

    getMute() {
        return this._audioState.muted;
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
            this._audioState.globalTime = position;

            if (this._audioState.currentEpisode != epIdx) {
                this._audioState.currentEpisode = epIdx;
                this._audioState.audio.pause();
                this._options.loader.setPosition(position);
                this._options.loader.disableChangePosition();
                console.log("Set position 1", this._audioState)
                let savedState = $.extend(true, {}, this._audioState);
                this._options.loader
                    .getAudioResource(newStart.episode.audio.file)
                    .then((a) => {
                        let inf = $.extend(true, {}, newStart.episode.audio.info);
                        inf.data = a.data;
                        this._audioState.currentEpisode = epIdx;

                        console.log("Set position 2", this._audioState)
                        this._setAudio(inf);

                        this._audioState.audio.currentTime = savedState.currentTime;
                        this._audioState.currentEpisode = epIdx;
                        this._audioState.globalTime = savedState.globalTime;
                        this._audioState.currentTime = savedState.currentTime;
                        this._audioState.baseTime = savedState.baseTime;

                        if (this._audioState.audio.readyState >= 1) {
                            this._onAudioLoadedHandler(this._audioState.audio);
                        }

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
                this._playElements(position);
                if (this._audioState.stopped) this._pauseElements();
            }
        }
    }

    getPosition() {
        return this._audioState.audio.globalTime;
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
        let newtitles = [];
        let deleteOld = false;
        for (let i = 0; i < this._elements.array.length; i++) {
            let el = this._elements.array[i];
            if (position >= el.Start && position <= (el.Start + el.Duration)) {
                el.Position = position - el.Start;

                if (this._audioState.playingNow[el.Id] === undefined) {
                    if (el.DeleteOldTitles === undefined && el.DeleteOldTitles) {
                        deleteOld = true;
                    }
                    if (el.Title)
                        newtitles.push({id: el.Id, title: el.Title})
                }

                this._audioState.playingNow[el.Id] = el;
            } else {
                if (el.Id in this._audioState.playingNow) {
                    delete this._audioState.playingNow[el.Id];
                    el.stop();
                }
                el.Position = 0;
            }
        }

        this._recalcTitles(newtitles, deleteOld);
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
        const ElConstructor = this._getElementConstructor();

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
                        elem = new ElConstructor(cont, elOptions);

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
            for (let i = 0; i < data.length; i++) {
                let track = data.tracks[i];
                for (let j = 0; j < track.elements.length; j++) {
                    if (track.elements[j].id == trackElId) return false;
                }
            }
        }
        return true;
    }

    _getElementOptions(elData) {
        let that = this;
        return {
            data: elData,
            designMode: this._options.designMode,
            loader: this._options.loader,
            onSetPosition: function (e) {
                if (that._options.onSetPosition) that._options.onSetPosition(e);
            },
            onFocused: function (e) {
                for (let i = 0; i < that._elements.array.length; i++) {
                    let el = that._elements.array[i];
                    if (el.Id != elData.id) el.Focused = false;
                }
                that.renderPosition(null);
                if (that._options.onFocused) that._options.onFocused(e);
            },
            onSetTextData: function (e) {
                for (let i = 0; i < that._elements.array.length; i++) {
                    let el = that._elements.array[i];
                    if (el.Data.trackElement == e.trackElId) {
                        // elData.data = e.data
                        if (that._options.onSetTextData) that._options.onSetTextData(e);
                    }
                }

            }
        }
    }

    _decodeElData(trackElData, zIndex) {
        let oldData = null;
        if (trackElData.id in this._elements.trackElIdx) {
            oldData = this._elements.trackElIdx[trackElData.id].Data;
            oldData.content.position = {
                left: trackElData.content.position.left,
                top: trackElData.content.position.top,
                bottom: trackElData.content.position.bottom,
                right: trackElData.content.position.right
            };
            oldData.content.duration = trackElData.duration;
            oldData.zIndex = zIndex;
            oldData.focused = trackElData.focused;
            oldData.data = trackElData.data;
            oldData.content.effects = $.extend(true, {}, trackElData.content.effects);
            oldData.content.title = trackElData.content.title;
            oldData.content.title2 = trackElData.content.title2;
            oldData.content.deleteOldTitles =
                trackElData.content.deleteOldTitles === undefined || trackElData.content.deleteOldTitles;
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

        oldData.content.effects = oldData.content.effects || [];

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

    _getElementConstructor() {
        return CPlayerElement;
    }
}
//    }
//);
