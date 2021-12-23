import CWSPlayer from './player'

export default class ExternalPlayer extends CWSPlayer {

    constructor(container, options, audioOptions) {
        super(container, options, audioOptions)

        this._audioState.externalPlayer = true;
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
                this._setAudio();
                this._broadcastSetData(data2._nativeAppDataUuid);
            }

            resolve()
        })
    }

    _setAudio() {
        // Сделано для соответсвтвия родительскому классу плеера
        this._initAudioTrack();
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

        if (position >= 0 && position <= maxEnd) {
            let data = this._options.loader.getData();
            let epIdx = 0;
            for (let i = 0; i < data.episodes.length; i++) {
                if (data.episodes[i].id === newStart.episode.id) {
                    epIdx = i;
                    break;
                }
            }

            this._audioState.baseTime = newStart.start;
            this._audioState.currentTime = position - newStart.start;
            this._audioState.globalTime = this._audioState.baseTime + this._audioState.currentTime;

            if (this._audioState.currentEpisode !== epIdx) {
                this._audioState.currentEpisode = epIdx;

                this._options.loader.setPosition(position);
                this._options.loader.disableChangePosition();

                this._audioState.currentEpisode = epIdx;
                this._setAudio();

                this._setElementsPosition(position);
                this._playElements(position);
                // if (this._audioState.stopped) this._pauseElements();

                this._options.loader.enableChangePosition();
            } else {
                this._options.loader.setPosition(position);
                this._setElementsPosition(position);
            }

            this._broadcastSetPosition(this._audioState)
        }
    }

    setRate(rate) {
        this._audioState.playbackRate = +rate;
        for (let i in this._audioState.playingNow) {
            if (!this._audioState.playingNow.hasOwnProperty(i)) continue;
            let el = this._audioState.playingNow[i];
            el.setRate(+rate);
        }
    }

    play() {
        return new Promise((resolve) => {
            this._onPlay();
            resolve();
        })
    }

    _proccessAnimationFrame() {
        if (!this._audioState.stopped) {
            this._playElements(this._audioState.globalTime);
            this._audioState.requestAnimationFrameID = requestAnimationFrame(this._proccessAnimationFrame.bind(this));
        }
    }

    pause() {
        return new Promise((resolve) => {
            this._audioState.stopped = true;
            cancelAnimationFrame(this._audioState.requestAnimationFrameID);
            this._pauseElements();
            resolve()
        });
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
}