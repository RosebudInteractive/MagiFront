import ResourceLoader from 'work-shop/resource-loader';
import {CONTENT_TYPE} from "../../../frontend/constants/common-consts";
import * as Player from "tools/player/nested-player";
import {PLAYER_CONTROLLER_MODE} from "../../../common/constants/common-consts";
import {calcContent} from "common-tools/player";
import React from "react";

const CONFIG = {
    cover: { },
    player: { }
}

export default class PlayerController {
    constructor() {
        this.lesson = null
        this.playInfo = null
        this._mode = PLAYER_CONTROLLER_MODE.COVER
        this.onChangeMode = null
        this.onChangeState = null
        this.state = {
            contentArray: [],
            currentTime: 0,
            availableRates: [
                {value: 0.75},
                {value: 1.0, title: 'Обычная'},
                {value: 1.25},
                {value: 1.5},
                {value: 1.75},
            ],
            finished: false
        }

        this._subscribers = []
    }

    get config() { return CONFIG}

    get mode() {
        return this._mode
    }

    subscribe(callback) {
        if (this._subscribers.indexOf(callback) === -1) {
            this._subscribers.push(callback)
        }
    }

    unsubscribe(callback) {
        const _index = this._subscribers.indexOf(callback)

        if (_index > -1) {
            this._subscribers.splice(_index, 1)
        }
    }

    initPlayer(options) {
        const currentTime = options ? options.currentTime : 0
        if (this.lesson) {
            if (this.lesson.ContentType === CONTENT_TYPE.AUDIO) {
                ResourceLoader.preinitAudio(this.lesson.Audios)
                this.initState = {
                    currentTime: currentTime,
                    muted: false,
                    volume: 0.3
                }
                Player.loadPlayInfo(this.playInfo, this.initState)
                this._setMode(PLAYER_CONTROLLER_MODE.PLAYER)
            }
        } else {
            this._notify("no loaded lesson")
        }
    }

    initPlay() {
        if (this.lesson) {
            Player.loadPlayInfo(this.playInfo, this.initState)
            // setTimeout(() => Player.getInstance().play(), 0)
        } else {
            this._notify("no loaded lesson")
        }
    }

    clear() {
        ResourceLoader.clearAudios()
    }

    setFullViewPort(div) {
        Player.setFullViewPort(div)
    }

    setLesson(lesson){
        if (lesson !== this.lesson) {
            if (this.lesson) {this.clear()}
        }
        this.lesson = lesson
    }

    setPlayInfo(playInfo) {
        if (playInfo !== this.playInfo) {
            if (this.playInfo) {this.clear()}
        }
        this.playInfo = playInfo
    }

    setContentArray(value) {
        const _value = calcContent(value)

        this.state.contentArray = [..._value.content]
        this.state.totalDuration = _value.totalDuration
        this.state.totalDurationFmt = _value.totalDurationFmt

        this._notifyStateChanged()
    }

    setCurrentContent(value) {
        if (this.state.currentContent !== value) {
            this.state.currentContent = value
            this._notifyStateChanged()
        }
    }

    setTitle(value) {
        if ((this.state.title !== value.title) || (this.state.subTitle !== value.subTitle)) {
            this.state.title = value.title
            this.state.subTitle = value.subTitle
            this._notifyStateChanged()
        }
    }

    setBufferedTime(value) {
        if (this.state.bufferedTime !== value) {
            this.state.bufferedTime = value
            this._notifyStateChanged()
        }
    }

    setCurrentTime(value) {
        if (this.state.currentTime !== value) {
            this.state.currentTime = value
            this._notifyStateChanged()
        }
    }

    setMute(value) {
        if (this.state.muted !== value) {
            this.state.muted = value
            this._notifyStateChanged()
        }
    }

    setRate(value) {
        if (this.state.rate !== value) {
            this.state.rate = value
            this._notifyStateChanged()
        }
    }

    setVolume(value) {
        if (this.state.volume !== value) {
            this.state.volume = value
            this._notifyStateChanged()
        }
    }

    setPaused() {
        if (!this.state.paused) {
            this.state.paused = true
            this._notifyStateChanged()
        }
    }

    setPlaying() {
        if (this.state.paused) {
            this.state.paused = false
            this.state.finished = false
            this._notifyStateChanged()
        }
    }

    setFinished() {
        this.state.paused = true
        this.state.finished = true
        this._notifyStateChanged()
        this._setMode(PLAYER_CONTROLLER_MODE.COVER)
    }

    isPlayerMode() {
        return this._mode === PLAYER_CONTROLLER_MODE.PLAYER
    }

    _notify(message) {
        console.error(message)
    }

    _notifyStateChanged() {
        if (this.onChangeState) {
            this.onChangeState(this.state)
        }

        this._subscribers.forEach((callback) => {callback(this.state)})
    }

    _setMode(value) {
        if (this._mode !== value) {
            this._mode = value

            if (this.onChangeMode) {
                this.onChangeMode(value)
            }
        }
    }

    requestSetCurrentTime(value) {
        Player.getInstance().setPosition(value)
    }

    requestSetRate(value) {
        Player.getInstance().setRate(value)
    }

    requestSetVolume(value) {
        Player.getInstance().setVolume(value)
    }

    requestToggleMute() {
        if (this.state.muted) {
            Player.getInstance().unmute()
        } else {
            Player.getInstance().mute()
        }
    }

    requestPause() {
        Player.getInstance().pause()
    }

    requestPlay() {
        Player.getInstance().play()
    }

    requestStop() {
        Player.getInstance().stop()
    }

    openRateTooltip() {
        if (!this.state.showRateTooltip) {
            this.state.showRateTooltip = true
            this._notifyStateChanged()
        }
    }

    closeRateTooltip() {
        if (this.state.showRateTooltip) {
            this.state.showRateTooltip = false
            this._notifyStateChanged()
        }
    }

    openContentTooltip() {
        if (!this.state.showContentTooltip) {
            this.state.showContentTooltip = true
            this._notifyStateChanged()
        }
    }

    closeContentTooltip() {
        if (this.state.showContentTooltip) {
            this.state.showContentTooltip = false
            this._notifyStateChanged()
        }
    }

    getPlayButton() {
        const _style = {cursor: 'pointer'};

        return <div style={_style} onClick={::this.initPlayer}>
            <span className="player-button _play">Воспроизвести</span>
        </div>
    }

    isMobile() {
        return false
    }
}