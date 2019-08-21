// import CWSPlayer from './player'
import YouTubePlayer from 'youtube-player';

const TIMEOUT = 500

export default class Player {

    constructor(divName, options, audioOptions) {
        this._audioState = {
            currentTime: (audioOptions && (audioOptions.currentTime !== undefined)) ? audioOptions.currentTime : 0,
            volume: (audioOptions && (audioOptions.volume !== undefined)) ? audioOptions.volume : 0.3,
            muted: (audioOptions && (audioOptions.muted !== undefined)) ? audioOptions.muted : false,
            rate: (audioOptions && (audioOptions.rate !== undefined)) ? audioOptions.rate : 1.0,
        };

        this._options = Object.assign({}, options)

        this._player = YouTubePlayer(divName, {
            videoId: audioOptions.videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
            }
        });
        this._currentTime = 0
        this._buffered = 0
        this._currentState = -1

        this._mainTimer = setInterval(::this._checkTimeChanged, TIMEOUT)

        this._player.on('ready', ::this._onPlayerReady)
        this._player.on('stateChange', ::this._onPlayerStateChange)
        this._player.on('playbackRateChange', ::this._broadcastRateChanged)
        this._player.on('error', ::this._onError)
    }

    _checkTimeChanged() {
        this._player.getCurrentTime().then((time) => {
            if (this._currentTime !== time) {
                this._currentTime = time
                this._broadcastCurrentTimeChanged(time)
            }
        })

        if (this._buffered < 1) {
            this._player.getVideoLoadedFraction().then((data) => {
                if (!(Math.abs(this._buffered - data) < Number.EPSILON)) {
                    this._buffered = data
                    this._options.onBuffered(data)
                }
            })
        }
    }

    _onPlayerReady(){
        this.setRate(+this._audioState.rate)
        this.setVolume(+this._audioState.volume)
        this.setMute(!!this._audioState.muted)

        this._broadcastReady()
    }

    _onPlayerStateChange(state) {
        if (this._currentState !== state.data) {

            this._currentState = state.data

            switch (state.data) {
                case YT.PlayerState.ENDED: {
                    this._broadcastEnded()
                    break
                }

                case YT.PlayerState.PLAYING: {
                    this._broadcastPlaying()
                    break
                }

                case YT.PlayerState.PAUSED: {
                    this._broadcastPaused()
                    break
                }

                case YT.PlayerState.BUFFERING: {
                    this._broadcastBuffered()
                    break
                }

                case YT.PlayerState.CUED: {
                    break
                }

                default:
                    return
            }
        }
    }

    play() {
        this._player.playVideo()
            .then(this._broadcastStarted())

    }

    pause() {
        this._player.pauseVideo()
            .then(this._broadcastPaused())
    }

    setMute(value) {
        if (!value) {
            this._player.unMute()
        } else {
            this._player.mute()
        }
    }

    toggleMute() {
        if (this._player.isMuted()) {
            this._player.unMute()
        } else {
            this._player.mute()
        }
    }

    getMute() {
        return this._player.isMuted();
    }

    setRate(rate) {
        this._player.setPlaybackRate(+rate)
    }

    getRate() {
        return this._player.getPlaybackRate()
    }

    getDuration() {
        return this._player.getDuration()
    }

    getAvailablePlaybackRates() {

    }

    setVolume(value) {
        this._player.setVolume(+value).then(() => {this._broadcastVolumeChanged()})
    }

    _broadcastReady() {
        if (this._options.onReady)
            this._options.onReady(this);
    }

    _broadcastStarted() {
        if (this._options.onStarted)
            this._options.onStarted();
    }

    _broadcastPaused() {
        if (this._options.onPaused)
            this._options.onPaused();
    }

    _broadcastCurrentTimeChanged(value) {
        if (this._options.onCurrentTimeChanged)
            this._options.onCurrentTimeChanged(value);
    }

    _broadcastEnded() {
        if (this._options.onEnded)
            this._options.onEnded();
    }

    _broadcastPlaying() {
        if (this._options.onPlaying) {
            this._options.onPlaying()
        }
    }

    _broadcastBuffered() {
        if (this._options.onBuffered) {
            this._player.getVideoLoadedFraction().then((data) => {
                console.log(data)
                this._options.onBuffered(data)
            })
        }
    }

    _broadcastRateChanged(value) {
        if (this._options.onRateChange) {
            this._options.onRateChange(value)
        }
    }

    _broadcastVolumeChanged() {
        if (this._options.onVolumeChanged) {
            this._player.getVolume().then((data) => {
                console.log(data)
                this._options.onVolumeChanged(data)
            })

        }
    }

    setData(data) {
        return new Promise((resolve) => {
            let data2 = $.extend(true, {}, data);
            this._options.loader.setData(data2);

            this._audioState.globalTime = 0;
            this._audioState.currentTime = 0;

            this._prepareElements();

            if (data2.episodes.length > 0) {
                this._audioState.currentEpisode = 0;
                this._broadcastSetData(data2._nativeAppDataUuid);
            }

            resolve()
        })
    }

    _initAudioTrack() {
        try {
            let data = this._options.loader.getData();
            let starts = this._options.loader.getEpisodesStartTimes();

            let startPos = starts[data.episodes[this._audioState.currentEpisode].id];
            this._audioState.globalTime = startPos.start + this._audioState.currentTime;
            this._audioState.baseTime = startPos.start;
            this._options.loader.setPosition(this._audioState.globalTime);
        } catch (e) {
            this._addDevErr(e.message)
            console.log(e)
        }
    }

    setPosition(position) {
        this._player.seekTo(position)
            .then(() => {return this._player.getCurrentTime()})
            .then((data) => {
                this._broadcastCurrentTimeChanged(data)
            })

        // let starts = this._options.loader.getEpisodesStartTimes();
        // let maxEnd = 0;
        // let newStart = null;
        // for (let id in starts) {
        //     let s = starts[id];
        //     if (s.end > maxEnd) {
        //         maxEnd = s.end;
        //     }
        //
        //     if (position >= s.start && position <= s.end) {
        //         newStart = s;
        //     }
        // }
        //
        // if (position >= 0 && position <= maxEnd) {
        //     let data = this._options.loader.getData();
        //     let epIdx = 0;
        //     for (let i = 0; i < data.episodes.length; i++) {
        //         if (data.episodes[i].id === newStart.episode.id) {
        //             epIdx = i;
        //             break;
        //         }
        //     }
        //
        //     this._audioState.baseTime = newStart.start;
        //     this._audioState.currentTime = position - newStart.start;
        //     this._audioState.globalTime = this._audioState.baseTime + this._audioState.currentTime;
        //
        //     if (this._audioState.currentEpisode !== epIdx) {
        //         this._audioState.currentEpisode = epIdx;
        //
        //         this._options.loader.setPosition(position);
        //         this._options.loader.disableChangePosition();
        //
        //         this._audioState.currentEpisode = epIdx;
        //         this._setAudio();
        //
        //         this._setElementsPosition(position);
        //         this._playElements(position);
        //         // if (this._audioState.stopped) this._pauseElements();
        //
        //         this._options.loader.enableChangePosition();
        //     } else {
        //         this._options.loader.setPosition(position);
        //         this._setElementsPosition(position);
        //     }
        //
        //     this._broadcastSetPosition(this._audioState)
        // }
    }

    _proccessAnimationFrame() {
        if (!this._audioState.stopped) {
            this._playElements(this._audioState.globalTime);
            this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
        }
    }

    onEnd() {
        let data = this._options.loader.getData();
        if (this._audioState.currentEpisode + 1 < data.episodes.length) {
            let newTime = 0;
            for (let i = 0; i <= this._audioState.currentEpisode; i++)
                newTime += data.episodes[i].audio.info.length;
            this.setPosition(newTime);
        } else {
            if (!this._audioState.stopped) {
                this._audioState.stopped = true;
                // this._broadcastPaused();
                // this._broadcastEnded();
            }
        }
    }

    onChangePosition(position){
        this._audioState.globalTime = position;
        this._audioState.currentTime = position - this._audioState.baseTime;
        this._options.loader.setPosition(position)
    }

    _onError() {

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
}