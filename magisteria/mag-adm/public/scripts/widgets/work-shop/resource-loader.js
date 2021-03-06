import Platform from 'platform';

const PRELOAD_TIME = 15;
const FAIL_TIME = 60;
const PRELOAD_AUDIO_TIME = 20;
const FAIL_AUDIO_TIME = 120;

let _audioMap = new Map();

// Такая проверка добавлена для того чтобы обработать настройку "Запрос настольного веб-сайта"
// Так как при ее включении сафари определяется как десктопный с ос mac OS X 10.15
const isIOSWithEnabledDesktopBrowser = () => {
    const _ua = window.navigator.userAgent.toLowerCase();

    return _ua.indexOf('macintosh') > -1 && 'ontouchend' in document
}

const isMobileAppleDevice = () => {
    const _isTrueIOS = Platform.os.family === "iOS"

    return _isTrueIOS || isIOSWithEnabledDesktopBrowser()
}

const _isIOS = isMobileAppleDevice(),
    _isAndroid = Platform.os.family === "Android",
    _isSafariOnMac = (Platform.os.family === "OS X") && (Platform.name === "Safari"),
    _usePreinit = (_isIOS || _isAndroid || _isSafariOnMac);

export default class CWSResourceLoader {

    static clearAudios() {
        _audioMap.forEach((audio) => {
            audio.src = ''
        })

        _audioMap.clear()
    }

    static preinitAudio(sources) {
        if (_usePreinit) {
            let _mapKeys = _audioMap.keys();
            let _sourceNotEqual = (_audioMap.size !== sources.length) || sources.some((src) => {
                let _source = src.indexOf("://") >= 0 ? src : '/data/' + src,
                    _key = _mapKeys.next()
                return _source !== _key.value
            })

            if (_sourceNotEqual) {
                _audioMap.clear();
                sources.forEach((src) => {
                    let _src = src.indexOf("://") >= 0 ? src : '/data/' + src,
                        _audio = new Audio()

                    _audio.src = _src;
                    _audio.load();
                    _audio.src = '';

                    _audioMap.set(_src, _audio);
                })
            }
        }
    }

    constructor(options) {
        this._position = 0;
        this._state = this._getInitialState();
        this._options = options;


        /*
        {
            id: "",
            s: {url: "", body: byteArray},
            m: {url: "", body: byteArray},
            l: {url: "", body: byteArray},
         }
         */
        this._state.loadedData = {
            assets: {},
            audios: {}
        };

        this._state.loadedAudio = {};

        this._recheck = false;

        this._executeMonitor();
    }

    _getInitialState() {
        return {
            data: {},
            assetsIdx: {},
            audio: null,
            mode: 2,
            loadQueue: [],
            loadAudioQueue: [],
            loading: {},
            loadingAudio: {},
            loaderInt: null,
            disableChange: false,
            loadedData: {
                assets: {},
                audios: {}
            },
        }
    }

    // load images
    // tiny - 0, medium - 1, large - 2
    setMode(mode) {
        if (mode != this._state.mode) {
            this._state.mode = mode;
            this._recheck = true;
        }
    }

    setData(data) {
        this._state.data = $.extend(true, {}, data);

        this._state.episodeStarts = {};
        let cur = 0;
        for (let i = 0; i < this._state.data.episodes.length; i++) {
            let e = this._state.data.episodes[i];
            this._state.episodeStarts[e.id] = {
                start: cur,
                end: cur + (+e.audio.info.length),
                episode: e,
                isLast: i === (this._state.data.episodes.length - 1)
            };
            cur += +e.audio.info.length;
        }

        this._analizeData(this._state.data);
        this._recheck = true;
    }

    getData() {
        return this._state.data;
    }

    _analizeData(data) {
        this._createAssetsIdx(data.assets);
        this._makeTracks(data.episodes);
    }

    _makeTracks(episodes) {
        for (let i = 0; i < episodes.length; i++) {
            let episode = episodes[i];
            let start = this._state.episodeStarts[episode.id];
            let tracks = [];
            let tracksIdx = {};
            for (let j = 0; j < episode.elements.length; j++) {
                let el = episode.elements[j];
                let tId = el.content.track;
                let track = null;
                if (tracksIdx[tId] === undefined) {
                    track = {id: tId, elements: []};
                    tracksIdx[tId] = tracks.length;
                    tracks.push(track);
                } else {
                    track = tracks[tracksIdx[tId]];
                }

                track.elements.push(el);
                el.start = start.start + el.start;
            }

            if (tracks.length == 0) {
                tracks.push({id: 1, elements: []});
                tracksIdx[1] = 0;
            } else {
                tracks.sort((a, b) => {
                    return Math.sign(a.id - b.id);
                });
            }

            episode.tracks = tracks;
            episode.tracksIdx = tracksIdx;
        }
    }

    _createAssetsIdx(assets) {
        assets = assets || [];
        if (!Array.isArray(assets)) assets = [assets];

        let assetsIdx = {};
        for (let i = 0; i < assets.length; i++) {
            let a = assets[i];
            if (a.id) assetsIdx[a.id] = a;
        }

        this._state.assetsIdx = assetsIdx;
    }

    setPosition(position) {
        if (this._state.disableChange) return;
        if (this._position != position) {
            if (Math.abs(this._position - position) > 1) {
                this._recheck = true;
            }
            this._position = position;
        }
    }

    disableChangePosition() {
        this._state.disableChange = true;
    }

    enableChangePosition() {
        this._state.disableChange = false;
    }

    getAsset(id) {
        return this._state.assetsIdx[id];
    }

    getAssetResources(ids) {
        ids = ids || [];
        if (!Array.isArray(ids)) ids = [ids];

        return new Promise((resolve, reject) => {
            let beg = new Date();
            let result = this._getFromLoaded(ids);
            if (!result.success) {
                // console.warn("resource loader: begin to waiting for resource download " + JSON.stringify(ids));
                let int = setInterval(() => {
                    result = this._getFromLoaded(ids);
                    if (result.success) {
                        clearInterval(int);
                        resolve(result.assets);
                        return;
                    }

                    let now = new Date();
                    if (now.getTime() - beg.getTime() > FAIL_TIME * 1000) {
                        clearInterval(int);
                        reject("timeout: " + JSON.stringify(ids));
                    }
                }, 100);
            } else {
                resolve(result.assets);
            }
        });
    }

    getAudioResource(id) {
        return new Promise((resolve, reject) => {
            let beg = new Date();
            let result = this._getFromLoadedAudios(id);
            if (!result.success) {
                let int = setInterval(() => {
                    result = this._getFromLoadedAudios(id);
                    if (result.success) {
                        clearInterval(int);
                        resolve(result.audio);
                        return;
                    }

                    let now = new Date();
                    if (now.getTime() - beg.getTime() > FAIL_AUDIO_TIME * 1000) {
                        clearInterval(int);
                        reject("timeout");
                    }
                }, 100);
            } else {
                resolve(result.audio);
            }
        });
    }

    _getFromLoadedAudios(id) {
        let result = {
            success: false,
            audio: null
        }

        if (!this._state.loadedData.audios[id]) {
            return false;
        }

        let a = {
            id: id
        };

        a.data = this._state.loadedData.audios[id];

        result.success = true;
        result.audio = a;
        return result;
    }

    _getFromLoaded(ids) {
        let result = {
            success: false,
            assets: []
        }
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            if (!this._state.loadedData.assets[id]) {
                return false;
            }

            let a = {
                id: id
            };
            let loadedAsset = this._state.loadedData.assets[id];

            switch (this._state.mode) {
                case 0:
                    if (!loadedAsset.s) return result;
                    a.file = loadedAsset.s;
                    break;
                case 1:
                    if (!loadedAsset.m) return result;
                    a.file = loadedAsset.m;
                    break;
                case 2:
                    if (!loadedAsset.l) return result;
                    a.file = loadedAsset.l;
                    break;
            }
            result.assets.push(a);
        }

        result.success = true;
        return result;
    }

    _executeMonitor() {
        this._state.interval = setInterval(() => {
            this._monitor();
        }, 500);

        this._state.loaderInt = setInterval(() => {
            this._loadFromQueue();
        }, 100);

        const _isExternal = this._options && this._options.isExternal
        
        if (!_isExternal) {
            this._state.loaderAudioInt = setInterval(() => {
                this._loadFromAudioQueue();
            }, 100);
        }
    }

    _monitor() {
        // if assets, tracks, mode or position were changed,
        // then recheck if some data needs to be cleared
        if (this._recheck) {
            this._checkAssets();
        }

        let nearestIds = this._getNearestAssets();
        let notLoadedIds = this._getNotLoaded(nearestIds);
        // if there was critical changes, then immediately load these assets
        // if (notLoadedIds.length > 0)
        //     console.log("push to queue", notLoadedIds)
        this._pushToQueue(this._recheck, notLoadedIds);
        this._recheck = false;

        this._monitorAudios();
    }

    _monitorAudios() {
        let audios = this._getNearestAudios();
        let notLoaded = this._getNotLoadedAudios(audios);

        this._pushToAudioQueue(this._recheck, notLoaded);
    }

    _getNotLoadedAudios(ids) {
        let notLoaded = [];
        for (let i = 0; i < ids.length; i++) {
            if (!this._state.loadedData.audios[ids[i]]) {

                notLoaded.push(ids[i]);
            }
        }

        return notLoaded;
    }

    _getNearestAudios(position) {
        let ids = [];
        position = position === undefined ? this._position : position;
        let episode = this._getEpisodeAt(position);
        if (episode) {
            ids.push(episode.audio.file);
        }

        for (let eId in this._state.episodeStarts) {
            let e = this._state.episodeStarts[eId];
            if (e.start > position && e.start - position <= PRELOAD_AUDIO_TIME) {
                ids.push(e.episode.audio.file);
            }
        }

        return ids;
    }

    _pushToAudioQueue(toTop, ids) {
        if (ids.length == 0) return;
        for (let i = 0; i < ids.length; i++) {
            if (!this._alreadyInAudioQueue(ids[i])) {
                if (toTop) this._state.loadAudioQueue.unshift(ids[i]);
                else this._state.loadAudioQueue.push(ids[i]);
            }
        }
    }

    _alreadyInAudioQueue(id) {
        for (let i = 0; i < this._state.loadAudioQueue.length; i++) {
            if (this._state.loadAudioQueue[i] === id) return true;
        }

        return false;
    }

    _pushToQueue(toTop, ids) {
        if (ids.length === 0) return;

        for (let i = 0; i < ids.length; i++) {
            if (toTop) this._state.loadQueue.unshift(ids[i]);
            else this._state.loadQueue.push(ids[i]);
        }
    }

    _checkAssets() {
        // TODO release unneeded resources
    }

    _getNearestAssets(position) {
        let ids = [];

        position = position === undefined ? this._position : position;
        let episode = this._getEpisodeAt(position);
        if (!episode) return ids;

        for (let i = 0; i < episode.tracks.length; i++) {
            let track = episode.tracks[i];

            for (let j = 0; j < track.elements.length; j++) {
                let el = track.elements[j];

                if (!el.assetId) continue;
                if (el.start + el.content.duration < position) continue;

                if (el.start - position <= PRELOAD_TIME ||
                    (el.start < position && el.start + el.content.duration > position)) {
                    ids.push(el.assetId);
                }
            }
        }

        return ids;
    }

    _getEpisodeAt(position) {
        for (let eId in this._state.episodeStarts) {
            let e = this._state.episodeStarts[eId];

            if (e.isLast) {
                if (position >= e.start && position <= e.end) {
                    return e.episode;
                }
            } else {
                if (position >= e.start && position < e.end) {
                    return e.episode;
                }
            }
        }

        return null;
    }

    _getNotLoaded(ids) {
        let notLoaded = [];

        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let l = this._state.loadedData.assets[id];
            if (!l) {
                notLoaded.push(id);
                continue;
            }

            let mode = this._state.mode;
            if ((mode == 0 && !l.s) ||
                (mode == 1 && !l.m) ||
                (mode == 2 && !l.l)
            ) {
                notLoaded.push(id);
            }
        }

        return notLoaded;
    }

    _alreadyLoadedAsset(id) {
        return this._state.loadedData.assets[id] !== undefined ||
            this._state.loading[id] !== undefined;
    }

    _alreadyLoadedAudio(id) {
        return this._state.loadedData.audios[id] !== undefined ||
            this._state.loadingAudio[id] !== undefined;
    }

    _createImageUrl(imgData, type) {
        let blob = new Blob([imgData], {
            type: (type || 'image/*')
        });
        return URL.createObjectURL(blob);
    }

    _loadFromQueue() {
        if (this._state.loadQueue.length === 0) return;
        (function (that) {
            let id = that._state.loadQueue.shift();
            while (that._alreadyLoadedAsset(id)) {
                if (that._state.loadQueue.length === 0) {
                    return;
                }
                id = that._state.loadQueue.shift();
            }
            let asset = that._state.assetsIdx[id];
            let mode = that._state.mode;
            if (asset) {
                that._state.loading[id] = true;
                let url = asset.file.indexOf("://") >= 0 ? asset.file : "/data/" + asset.file;
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "binary",
                    processData: false,
                    responseType: 'arraybuffer',
                    success: function (result) {
                        let loaded = that._state.loadedData.assets[id];
                        if (!loaded) {
                            loaded = {
                                id: id
                            }
                        }

                        let b = that._createImageUrl(result, asset.info["mime-type"])

                        let res = {
                            url: url,
                            body: b
                        };

                        switch (mode) {
                            case 0:
                                loaded.s = res;
                                break;
                            case 1:
                                loaded.m = res;
                                break;
                            case 2:
                                loaded.l = res;
                                break;
                        }

                        that._state.loadedData.assets[id] = loaded;
                        delete that._state.loading[id];
                    },
                    error: (e) => {
                        console.log('getAsset ajax error: url, e', url, e)
                        delete that._state.loading[id];
                        that._broadcastAssetMissing(url)
                    }
                });
            } else {
                // console.warn("resource loader: asset not found. id = " + id);
            }
        })(this);
    }

    _loadFromAudioQueue() {
        if (this._state.loadAudioQueue.length === 0) {
            return;
        }

        let id = this._state.loadAudioQueue.shift();
        while (this._alreadyLoadedAudio(id)) {
            id = this._state.loadAudioQueue.shift();
            if (this._state.loadAudioQueue.length === 0) {
                break;
            }
        }

        if (id && !this._alreadyLoadedAudio(id)) {
            let url = id.indexOf("://") >= 0 ? id : "/data/" + id;

            let audio = null;

            if (_usePreinit) {
                audio = _audioMap.get(url)

                if (!audio) {
                    audio = new Audio()
                    audio.preload = 'none'
                    _audioMap.set(url, audio)
                } else {
                    audio.currentTime = 0;
                }
            } else {
                audio = new Audio()
                audio.preload = 'none'
            }

            setTimeout(() => {
                audio.src = url;
                // console.log('load : ', audio.src);
                audio.load();
            }, 500);

            audio.onerror = () => {
                this._broadcastError({
                    src: audio.src,
                    message: audio.error.message ? audio.error.message : 'unknown',
                    code : audio.error.code !== undefined ? audio.error.code : 'unknown'
                })
            }

            this._state.loadedData.audios[id] = {
                id: id,
                body: audio
            };
        }
    }

    getEpisodesStartTimes() {
        return this._state.episodeStarts;
    }

    destroy() {
        clearInterval(this._state.interval);
        clearInterval(this._state.loaderInt);
        if (this._state.loaderAudioInt) {
            clearInterval(this._state.loaderAudioInt);
        }

        this._state = this._getInitialState();
    }

    _broadcastError(err) {
        if (this._options && this._options.onError) {
            this._options.onError(err)
        }
    }

    _broadcastAssetMissing(data) {
        if (this._options && this._options.onAssetMissing) {
            this._options.onAssetMissing(data)
        }
    }
}

window.preinitAudio = CWSResourceLoader.preinitAudio
