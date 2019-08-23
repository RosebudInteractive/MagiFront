// import CWSPlayer from './player'
import YouTubePlayer from 'youtube-player';

const TIMEOUT = 500

export default class Player {

    constructor({divName, callbacks, options}) {
        this._audioState = {
            currentTime: (options && (options.currentTime !== undefined)) ? options.currentTime : 0,
            volume: (options && (options.volume !== undefined)) ? options.volume : 0.3,
            muted: (options && (options.muted !== undefined)) ? options.muted : false,
            rate: (options && (options.rate !== undefined)) ? options.rate : 1.0,
        };

        this._callbacks = Object.assign({}, callbacks)

        this._player = YouTubePlayer(divName, {
            videoId: options.videoId,
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
                    this._callbacks.onBuffered(data)
                }
            })
        }
    }

    _onPlayerReady(){
        this.setRate(+this._audioState.rate)
        this.setVolume(+this._audioState.volume)
        this.setMute(!!this._audioState.muted)
        this.setPosition(+this._audioState.currentTime)

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
        return this._player.playVideo()
            .then(this._broadcastStarted())

    }

    pause() {
        return this._player.pauseVideo()
            .then(this._broadcastPaused())
    }

    replay() {
        this.setPosition(0)
            .then(this.play)
    }

    setMute(value) {
        if (!value) {
            this._player.unMute().then(() => {this._broadcastMutedChange(value)})
        } else {
            this._player.mute().then(() => {this._broadcastMutedChange(value)})
        }
    }

    toggleMute() {
        if (this._player.isMuted()) {
            this._player.unMute().then(() => {this._broadcastMutedChange(false)})
        } else {
            this._player.mute().then(() => {this._broadcastMutedChange(true)})
        }
    }

    getMute() {
        return this._player.isMuted();
    }

    setRate(rate) {
        return this._player.setPlaybackRate(+rate)
    }

    getRate() {
        return this._player.getPlaybackRate()
    }

    getDuration() {
        return this._player.getDuration()
    }

    getAvailablePlaybackRates() {
        return this._player.getAvailablePlaybackRates()
    }

    setVolume(value) {
        if (this._audioState.volume === value) return;

        let oldVol = +this._audioState.volume;
        this._audioState.volume = value;
        let volDiff = value - oldVol;
        let part = volDiff / 300;
        let start = performance.now();

        let that = this;
        requestAnimationFrame(function _changeVolumeCallback(time) {
            let diffTime = time - start;
            if (diffTime > 300) {
                that._player.setVolume(+value)
                that._broadcastVolumeChanged(+value)

                return
            }

            let newVol = oldVol + part * diffTime;
            if (newVol < 0) newVol = 0;
            if (newVol > 100) newVol = 100;

            that._player.setVolume(newVol)
            that._broadcastVolumeChanged(newVol)
            requestAnimationFrame(_changeVolumeCallback);
        });


        // this._player.setVolume(+value).then(() => {this._broadcastVolumeChanged(+value)})
    }

    _broadcastReady() {
        if (this._callbacks.onReady)
            this._callbacks.onReady(this);
    }

    _broadcastStarted() {
        if (this._callbacks.onStarted)
            this._callbacks.onStarted();
    }

    _broadcastPaused() {
        if (this._callbacks.onPaused)
            this._callbacks.onPaused();
    }

    _broadcastCurrentTimeChanged(value) {
        if (this._callbacks.onCurrentTimeChanged)
            this._callbacks.onCurrentTimeChanged(value);
    }

    _broadcastEnded() {
        if (this._callbacks.onEnded)
            this._callbacks.onEnded();
    }

    _broadcastPlaying() {
        if (this._callbacks.onPlaying) {
            this._callbacks.onPlaying()
        }
    }

    _broadcastBuffered() {
        if (this._callbacks.onBuffered) {
            this._player.getVideoLoadedFraction().then((data) => {
                console.log(data)
                this._callbacks.onBuffered(data)
            })
        }
    }

    _broadcastRateChanged(value) {
        if (this._callbacks.onRateChange) {
            this._callbacks.onRateChange(value.data)
        }
    }

    _broadcastVolumeChanged(value) {
        if (this._callbacks.onVolumeChanged) {
            if (value !== undefined) {
                this._callbacks.onVolumeChanged(value)
                console.log(value)
            } else {
                this._player.getVolume().then((data) => {
                    console.log(data)
                    this._callbacks.onVolumeChanged(data)
                })
            }
        }
    }

    _broadcastMutedChange(value) {
        if (this._audioState.muted !== value) {
            this._audioState.muted = value

            if (this._callbacks.onMutedChange) {
                this._callbacks.onMutedChange(value)
            }
        }
    }

    // setData(data) {
    //     return new Promise((resolve) => {
    //         let data2 = $.extend(true, {}, data);
    //         this._callbacks.loader.setData(data2);
    //
    //         this._audioState.globalTime = 0;
    //         this._audioState.currentTime = 0;
    //
    //         this._prepareElements();
    //
    //         if (data2.episodes.length > 0) {
    //             this._audioState.currentEpisode = 0;
    //             this._broadcastSetData(data2._nativeAppDataUuid);
    //         }
    //
    //         resolve()
    //     })
    // }

    // _initAudioTrack() {
    //     try {
    //         let data = this._callbacks.loader.getData();
    //         let starts = this._callbacks.loader.getEpisodesStartTimes();
    //
    //         let startPos = starts[data.episodes[this._audioState.currentEpisode].id];
    //         this._audioState.globalTime = startPos.start + this._audioState.currentTime;
    //         this._audioState.baseTime = startPos.start;
    //         this._callbacks.loader.setPosition(this._audioState.globalTime);
    //     } catch (e) {
    //         this._addDevErr(e.message)
    //         console.log(e)
    //     }
    // }

    setPosition(position) {
        return this._player.seekTo(position)
            .then(() => {return this._player.getCurrentTime()})
            .then((data) => {
                this._broadcastCurrentTimeChanged(data)
            })
    }

    _proccessAnimationFrame() {
        if (!this._audioState.stopped) {
            this._playElements(this._audioState.globalTime);
            this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
        }
    }

    onEnd() {
        let data = this._callbacks.loader.getData();
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
        this._callbacks.loader.setPosition(position)
    }

    _onError() {
    }
}