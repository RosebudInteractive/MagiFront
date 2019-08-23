import 'work-shop/youtube-player'
import YoutubePlayer from "work-shop/youtube-player";
import {store} from "../../store/configureStore";
import * as playerActions from "actions/player-actions";

const MARKER = '/embed/'

export default class YoutubePlayerWrapper {

    constructor({div, initState}) {
        this.divName = div.attr('id')
        this.options = Object.assign({}, initState)

        this._player = null
        this._currentTime = this.options.currentTime
        this.totalDuration = 0
    }

    setData(data) {
        // Todo : дополнить провериками
        let _videoLink = data.episodes[0].videoLink,
            _pos = _videoLink.indexOf(MARKER) + MARKER.length

        this.options.videoId = _videoLink.substring(_pos)
        this._data = Object.assign({}, data)

        new YoutubePlayer({divName: this.divName, options: this.options, callbacks: this._getCallbacks()})
    }

    getLectureContent() {
        return this._data.episodes.map((item) => {
            return {
                title: item.title,
                duration: item.audio.info.length,
                duration_formated: item.audio.info.length_formatted,
                content: []
            }
        });
    }

    render() {

    }

    play() {
        this._player.play()
    }

    pause() {
        this._player.pause()
    }

    stop() {
        this._player.stop()
            .then(() => {
                store.dispatch(playerActions.stop())
            })
    }

    setPosition(value) {
        this._player.setPosition(value)
    }

    setRate(value) {
        this._player.setRate(value)
    }

    mute() {
        this._player.setMute(true)
        this.options.muted = true
    }

    unMute() {
        this._player.setMute(false)
        this.options.muted = false
    }

    setVolume(value) {
        this._player.setVolume(value * 100)
    }

    getAudioState() {
        return this.options
    }

    _getCallbacks() {
        let that = this

        return {
            onReady: (player) => {
                that._player = player
                let _data = {}

                player.getDuration()
                    .then((data) => {
                        that.totalDuration = data
                        store.dispatch(playerActions.setTotalDuration(data))
                    })
                    .then(() => {return player.getMute()})
                    .then((data) => {
                        store.dispatch(playerActions.setMuteState(data))
                    })
                    .then(() => {return player.getAvailablePlaybackRates()})
                    .then((data) => {
                        store.dispatch(playerActions.setAvailableRates(this._convertRates(data)))
                    })
                    .then(() => {return player.getRate()})
                    .then((data) => {
                        store.dispatch(playerActions.setRate(data))
                    })
                    .catch(console.log)
            },
            onCurrentTimeChanged: (data) => {
                that._setCurrentTime(data)
            },
            onVolumeChanged: (value) => {
                store.dispatch(playerActions.setVolume(value / 100))
                this.options.volume = value
            },
            onChangeTitles: (titles) => {
                // that.setState({
                //     title: titles.title,
                //     subtitle: titles.subtitle
                // })
            },
            onChangeContent: () => {

            },
            onPlaying: () => {
                store.dispatch(playerActions.play())
            },
            onPaused: () => {
                store.dispatch(playerActions.pause())
            },
            onStarted: () => {
                store.dispatch(playerActions.play())
            },
            onEnded: () => {
                store.dispatch(playerActions.end())
            },
            onBuffered: (value) => {
                store.dispatch(playerActions.setBufferedTime(value * this.totalDuration))
            },
            onRateChange: (value) => {
                store.dispatch(playerActions.setRate(value))
            },
            onMutedChange: (value) => {
                store.dispatch(playerActions.setMuteState(value))
            },
            onError: (e) => {
                console.log(e)
            },
        };
    }

    _setCurrentTime(value) {
        let _delta = value - this.options.currentTime;
        if ((_delta > 0.5) || (_delta < 0)) {
            this.options.currentTime = value;
            store.dispatch(playerActions.setCurrentTime(value))
        }
    }

    _convertRates(data) {
        return data.map((item) => {
            const _isNormalRate = Math.abs(+item - 1) < Number.EPSILON

            return _isNormalRate ? {value: item, title: 'Обычная'} : {value: item}
        })
    }
}