define (
    [],
    function () {
        const PRELOAD_TIME = 5;
        const FAIL_TIME = 60;
        const PRELOAD_AUDIO_TIME = 20;
        const FAIL_AUDIO_TIME = 120;
        return class CWSResourceLoader {
            constructor() {
                this._position = 0;
                this._state = {
                    data: {},
                    assetsIdx: {},
                    audio: null,
                    mode: 2,
                    loadQueue: [],
                    loadAudioQueue: [],
                    loading: {},
                    loadingAudio: {},
                    loaderInt: null,
                    disableChange: false
                }

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
                }

                this._state.loadedAudio = {}

                this._recheck = false;

                this._executeMonitor();
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
                this._state.data = {...data};

                this._state.episodeStarts = {};
                var cur = 0;
                for (var i = 0; i < this._state.data.episodes.length; i++) {
                    var e = this._state.data.episodes[i];
                    this._state.episodeStarts[e.id] = {
                        start: cur,
                        end: cur + (+e.audio.info.length),
                        episode: e
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
                for (var i = 0; i < episodes.length; i++) {
                    var episode = episodes[i];
                    var start = this._state.episodeStarts[episode.id];
                    var tracks = [];
                    var tracksIdx = {};
                    for (var j = 0; j < episode.elements.length; j++) {
                        var el = episode.elements[j];
                        var tId = el.content.track;
                        var track = null;
                        if (tracksIdx[tId] === undefined) {
                            track = {id : tId, elements: []};
                            tracksIdx[tId] = tracks.length;
                            tracks.push(track);
                        } else {
                            track = tracks[tracksIdx[tId]];
                        }

                        track.elements.push(el);
                        el.start = start.start + el.start;
                    }

                    tracks.sort((a, b) => {
                        return Math.sign(a.id - b.id);
                    });

                    episode.tracks = tracks;
                    episode.tractsIdx = tracksIdx;
                }
            }

            _createAssetsIdx(assets) {
                assets = assets || [];
                if (!Array.isArray(assets)) assets = [assets];

                var assetsIdx = {};
                for (var i = 0; i < assets.length; i++) {
                    var a = assets[i];
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
                    var beg = new Date();
                    console.log("try to get 1", ids)
                    var result = this._getFromLoaded(ids);
                    if (!result.success) {
                        var int = setInterval(() => {
                            console.log("try to get 2", ids)
                            result = this._getFromLoaded(ids);
                            console.log("get result 2", ids)
                            if (result.success) {
                                clearInterval(int);
                                resolve(result.assets);
                                return;
                            }

                            var now = new Date();
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
                    var beg = new Date();
                    var result = this._getFromLoadedAudios(id);
                    if (!result.success) {
                        var int = setInterval(() => {
                            result = this._getFromLoadedAudios(id);
                            if (result.success) {
                                clearInterval(int);
                                resolve(result.audio);
                                return;
                            }

                            var now = new Date();
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
                var result = {
                    success: false,
                    audio: null
                }

                if (!this._state.loadedData.audios[id]) {
                    return false;
                }

                var a = {
                    id: id
                };
                var loaded = this._state.loadedData.audios[id];
                a.data = loaded;

                result.success = true;
                result.audio = a;
                return result;
            }

            _getFromLoaded(ids) {
                var result = {
                    success: false,
                    assets: []
                }
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    if (!this._state.loadedData.assets[id]) {
                        return false;
                    }

                    var a = {
                        id: id
                    };
                    var loadedAsset = this._state.loadedData.assets[id];

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

                this._state.loaderAudioInt = setInterval(() => {
                    this._loadFromAudioQueue();
                }, 100);
            }

            _monitor() {
                // if assets, tracks, mode or position were changed,
                // then recheck if some data needs to be cleared
                if (this._recheck) {
                    this._checkAssets();
                }

                var nearestIds = this._getNearestAssets();
                var notLoadedIds = this._getNotLoaded(nearestIds);
                // if there was critical changes, then immediately load these assets
                if (notLoadedIds.length > 0)
                    console.log("push to queue", notLoadedIds)
                this._pushToQueue(this._recheck, notLoadedIds);
                this._recheck = false;

                this._monitorAudios();
            }

            _monitorAudios() {
                var audios = this._getNearestAudios();
                var notLoaded = this._getNotLoadedAudios(audios);

                this._pushToAudioQueue(this._recheck, notLoaded);
            }

            _getNotLoadedAudios(ids) {
                var notLoaded = []
                for (var i = 0; i < ids.length; i++) {
                    if (!this._state.loadedData.audios[ids[i]]) {

                        notLoaded.push(ids[i]);
                    }
                }

                return notLoaded;
            }

            _getNearestAudios(position) {
                var ids = [];
                var position = position === undefined ? this._position : position;
                var episode = this._getEpisodeAt(position);
                if (episode) {
                    ids.push(episode.audio.file);
                }

                for (var eId in this._state.episodeStarts) {
                    var e = this._state.episodeStarts[eId];
                    if (e.start > position && e.start - position <= PRELOAD_AUDIO_TIME) {
                        ids.push(e.episode.audio.file);
                    }
                }

                return ids;
            }

            _pushToAudioQueue(toTop, ids) {
                if (ids.length == 0) return;
                for (var i = 0; i < ids.length; i++) {
                    if (!this._alreadyInAudioQueue(ids[i])) {
                        if (toTop) this._state.loadAudioQueue.unshift(ids[i]);
                        else this._state.loadAudioQueue.push(ids[i]);
                    }
                }
            }

            _alreadyInAudioQueue(id) {
                for (var i = 0; i < this._state.loadAudioQueue.length; i++) {
                    if (this._state.loadAudioQueue[i] == id) return true;
                }

                return false;
            }

            _pushToQueue(toTop, ids) {
                if (ids.length == 0) return;

                for (var i = 0; i < ids.length; i++) {
                    if (toTop) this._state.loadQueue.unshift(ids[i]);
                    else this._state.loadQueue.push(ids[i]);
                }
            }

            _checkAssets() {
                // TODO release unneeded resources
            }

            _getNearestAssets(position) {
                var ids = [];

                position = position === undefined ? this._position : position;
                 var episode = this._getEpisodeAt(position);
                 if (!episode) return ids;

                for (var i = 0; i < episode.tracks.length; i++) {
                    var track = episode.tracks[i];

                    for (var j = 0; j < track.elements.length; j++) {
                        var el = track.elements[j];

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
                for (var eId in this._state.episodeStarts) {
                    var e = this._state.episodeStarts[eId];
                    if (position >= e.start && position <= e.end) {
                        return e.episode;
                    }
                }

                return null;
            }

            _getNotLoaded(ids) {
                var notLoaded = [];

                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    var l = this._state.loadedData.assets[id];
                    if (!l) {
                        notLoaded.push(id);
                        continue;
                    }

                    var mode = this._state.mode;
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
                var blob = new Blob([imgData], {
                    type: (type || 'image/*')
                });
                return URL.createObjectURL(blob);
            }

            _loadFromQueue() {
                if (this._state.loadQueue.length == 0) return;
                (function (that) {
                    that._state.loaderInt = null;
                    var id = that._state.loadQueue.shift();
                    while (that._alreadyLoadedAsset(id)) {
                        if (that._state.loadQueue.length == 0) {
                            return;
                        }
                        id = that._state.loadQueue.shift();
                    }
                    var asset = that._state.assetsIdx[id];
                    var mode = that._state.mode;
                    if (asset) {
                        that._state.loading[id] = true;
                        var url = "/data/" + asset.file;
                        $.ajax({
                            url: url,
                            type: "GET",
                            dataType: "binary",
                            processData: false,
                            responseType: 'arraybuffer',
                            success: function (result) {
                                var loaded = that._state.loadedData.assets[id];
                                if (!loaded) {
                                    loaded = {
                                        id: id
                                    }
                                }

                                var b = that._createImageUrl(result, asset.info["mime-type"])

                                var res = {
                                    url: url,
                                    body: b
                                }

                                switch (mode) {
                                    case 0: loaded.s = res; break;
                                    case 1: loaded.m = res; break;
                                    case 2: loaded.l = res; break;
                                }

                                that._state.loadedData.assets[id] = loaded;
                                delete that._state.loading[id];
                                console.log("Loaded asset", id, loaded);
                            },
                            fail: function (err) {
                                delete that._state.loading[id];
                                console.error(err);
                            }
                        });
                    }
                })(this);
            }

            _loadFromAudioQueue() {
                if (this._state.loadAudioQueue.length == 0) {
                    return;
                }

                var id = this._state.loadAudioQueue.shift();
                while (this._alreadyLoadedAudio(id)) {
                    id = this._state.loadAudioQueue.shift();
                    if (this._state.loadAudioQueue.length == 0) {
                        break;
                    }
                }

                if (id && !this._alreadyLoadedAudio(id)) {
                    var url = "/data/" + id;
                    var audio = new Audio();
                    audio.preload = true;
                    audio.src = url;
                    this._state.loadedData.audios[id] = {
                        id: id,
                        body: audio
                    };
                }
            }

            getEpisodesStartTimes() {
                return this._state.episodeStarts;
            }

        }
    }
);