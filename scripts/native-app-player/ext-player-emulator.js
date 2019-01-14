const _interval = 100 //ms

export default class PlayerEmulator {

    constructor({view}) {
        this._currentTime = 0;
        this._rate = 1;

        this._timer = null;
        this._view = view;
        this._playerId = view._id;
        this._totalDuration = 0;
    }

    setData(data) {
        this._clearTimer()

        this._view.setData(data)
        data.episodes.forEach((episode) => {
            this._totalDuration += episode.audio.info.length
        })

        this._totalDuration = this._totalDuration * 1000;
        this._playerId = this._view._id;
    }

    seek({position}) {
        this._currentTime = position * 1000;
        this._view.seek({position: position, playerId: this._playerId})
    }

    play({position}) {
        this._view.play({position: position, playerId: this._playerId})

        if (position !== undefined) {
            this._currentTime = position * 1000
        }

        this._timer = setInterval(() => {
            this._currentTime += _interval * this._rate;
            let _newTime = this._currentTime / 1000

            this._timeUpdate(_newTime)
        }, 100)
    }

    pause() {
        clearInterval(this._timer)
        this._view.pause({playerId: this._playerId});
    }

    setPlaybackSpeed(value) {
        this._rate = value;
        this._view.setPlaybackSpeed({rate: value, playerId: this._playerId})
    }

    _timeUpdate(value) {
        this._view.onChangePosition(value)
        $('.current-time_label').text(value)

        if (value >= this._totalDuration) {
            this._view.onEnd()
            clearInterval(this._timer)
        }
    }

    _clearTimer() {
        if (this._timer) {
            clearInterval(this._timer)
            this._currentTime = 0;
            this._rate = 1;
            $('.current-time_label').text(0)
        }
    }
}