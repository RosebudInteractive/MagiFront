import $ from 'jquery'

import * as playerActions from '../../actions/player-actions';
import {store} from '../../store/configureStore';

import Player from "work-shop/player";
import Loader from "work-shop/resource-loader"
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'work-shop/player-fork.css'
import {CONTENT_TYPE} from "../../constants/common-consts";
import VideoWrapper from './video-player-wrapper'

let _instance = null;
let _notifier = null

let Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.Utils = Utils;

let fullViewPort = null,
    smallViewPort = null;

let _cancelStartLessonId = 0;

class NestedPlayer {

    constructor(playingData, initState) {
        this._playingData = null;
        this._fullPlayer = null;

        this._videoMode = this._isVideoPlayer(playingData)

        this._setInitState(initState);
        this._setAssetsList(playingData);
        this.applyViewPorts();
        this._hasStoppedOnSwitch = false;
        this._applyData(playingData)
        this._currentTime = 0;
    }

    _isVideoPlayer(playingData) {
        return playingData && playingData.episodes && Array.isArray(playingData.episodes) && playingData.episodes[0] && playingData.episodes[0].contentType === CONTENT_TYPE.VIDEO
    }


    applyViewPorts() {
        let _isSmallActive = (this.player) && (this._smallPlayer) && (this.player === this._smallPlayer);


        let _isSameViewPort = (this._fullDiv && this._fullDiv.length && fullViewPort) ? this._fullDiv[0].isEqualNode(fullViewPort[0]) : false;
        if (fullViewPort && (!_isSameViewPort || !this._fullPlayer)) {
            this._fullDiv = fullViewPort;
            if (!this._fullPlayer) {
                let _options = this._getPlayerOptions();

                if (this._videoMode) {
                    this._fullPlayer = new VideoWrapper({div: fullViewPort, initState: this._initState})
                } else {
                    this._fullPlayer = new Player(fullViewPort, _options, this._initState);
                }

                this._fullPlayer.render();
            } else {
                if ((this._playingData) && this._fullDiv.length && (this._fullDiv[0].id === 'player' + this._playingData.id)) {
                    this._fullPlayer.initContainer(this._fullDiv);
                    this._fullPlayer.render();
                    if (this.audioState.audio) {
                        // todo : Отключено пока нет второго вьюпорта
                        // this.play()
                    }
                }
            }
        }

        _isSameViewPort = (this._smallDiv && smallViewPort) ? this._smallDiv[0].isEqualNode(smallViewPort[0]) : false;
        if (smallViewPort && (!_isSameViewPort || !this._smallPlayer)) {
            // this._smallDiv = smallViewPort;
            // this._smallPlayer = new Player(smallViewPort, _options);
            // this._smallPlayer.render();
        }

        this.player = _isSmallActive ?
            this._smallPlayer
            :
            this._fullPlayer ?
                this._fullPlayer
                :
                this._smallPlayer;
    }

    clearPlayInfo() {
        this._playingData = null;
    }

    clearFullViewPort(div) {
        let _isSameViewPort = (div && fullViewPort) ? div[0].isEqualNode(fullViewPort[0]) : false;

        if (_isSameViewPort) {
            fullViewPort = null;
            this._fullDiv = null;
        }

        if (this._videoMode) {
            fullViewPort = null;
            this._fullDiv = null;
            this.player.clear()
        }
    }

    get player() {
        return this._player
    }

    set player(value) {
        if (!this._player !== value) {
            this._player = value;
            this._isFull = value === this._fullPlayer;
        }
    }

    get audioState() {
        return this.player.getAudioState()
    }

    _loadOtherLesson(data, initState) {
        if (data) {
            if (this.player) {
                this.player.pause();
                this.player = null;
            }

            if (!this._videoMode) {
                this._fullPlayer.destroy();
                // this._smallPlayer.destroy();
            }


            this._fullPlayer = null;
            this._smallPlayer = null;

            this._videoMode = this._isVideoPlayer(data)

            this._setInitState(initState);
            this._setAssetsList(data);
            this.applyViewPorts();
            this._applyData(data);
            // setTimeout(() => {
            //     console.log('timeout play')
            //     this.play()
            // }, 0)
        }

        this._hasStoppedOnSwitch = false;
    }

    _setInitState(state) {
        if (state) {
            this._initState = Object.assign({}, state)
            if (!this._initState) {
                let _state = this.player._audioState;

                store.dispatch(playerActions.setMuteState(_state.muted))

                store.dispatch(playerActions.setRate(_state.playbackRate))
            }

        } else {
            this._initState = null;
        }
    }

    _setAssetsList(data) {
        this._playingData = data;
        this.assetsList = data.assets;
    }

    _applyData(data) {
        if (this._fullPlayer) {
            this._fullPlayer.setData(data);
        }

        if (this._smallPlayer) {
            this._smallPlayer.setData(data);
        }

        let content = this._fullPlayer ? this._fullPlayer.getLectureContent() : this._smallPlayer.getLectureContent();
        this._renderContent(content);
    }

    pause() {
        if (!this.player) {
            return
        }

        if (!this._videoMode) {
            this._hasStoppedOnSwitch = false;
        }

        return this.player.pause()
    }

    replay() {
        if (!this._initState) { this._initState = {} }
        this._initState.currentTime = 0;

        if (this._videoMode) {
            this.player.replay()
        } else {
            this.play()
        }
    }

    play() {
        if (!this.player) {
            return
        }

        if (this._videoMode) {
            this.player.play()
        } else {
            this.player.play()
                .then(() => {
                    if (this._initState) {
                        let _state = Object.assign({}, this._initState);
                        this._initState = null;
                        let _audioState = this.player._audioState;
                        if (_state.currentTime !== undefined) {
                            this.setPosition(_state.currentTime)
                        }

                        if (_state.muted !== undefined) {
                            if (_state.muted) {
                                this.mute()
                            } else {
                                this.unmute()
                            }
                        }

                        if (_state.volume !== undefined) {
                            this.setVolume(_state.volume)
                        } else {
                            store.dispatch(playerActions.setVolume(_audioState.volume))
                            if (_notifier) _notifier.setVolume(_audioState.volume)
                        }
                    }
                })
                .catch((e) => {
                    console.log(e)
                    store.dispatch(playerActions.canNotPlay())
                    if (_notifier) {_notifier.canNotPlay()}
                })

            this._hasStoppedOnSwitch = false;
        }
    }

    stop() {
        if (this._videoMode) {

        } else {
            this.player.pause()
                .then(() => {
                    store.dispatch(playerActions.stop())
                    if (_notifier) _notifier.stop()
                    // this.player = null;
                    // this.clearPlayInfo();
                    this._stopped = true;
                })
            this._hasStoppedOnSwitch = false;
        }
    }

    setPosition(begin) {
        this.player.setPosition(begin)
        // this._smallPlayer.setPosition(begin)
    }

    setRate(value) {
        this.player.setRate(value)

        if (!this._videoMode) {
            store.dispatch(playerActions.setRate(this.audioState.playbackRate))
            if (_notifier) _notifier.setRate(this.audioState.playbackRate)
        }
    }

    mute() {
        if (this._videoMode) {
            this.player.mute()
        } else {
            this.player.setMute(true);
            store.dispatch(playerActions.setMuteState(this.audioState.muted))
            if (_notifier) _notifier.setMute(this.audioState.muted)
        }
    }

    unmute() {
        if (this._videoMode) {
            this.player.unMute()
        } else {
            this.player.setMute(false);
            store.dispatch(playerActions.setMuteState(this.audioState.muted))
            if (_notifier) _notifier.setMute(this.audioState.muted)
        }
    }

    setVolume(value) {
        this.player.setVolume(value);
        // store.dispatch(playerActions.setVolume(value))
        // store.dispatch(playerActions.setVolume(this.audioState.volume))
    }

    _cancelStarting(){
        if (this.player) {
            this.player.pause();
            this.player = null;
        }

        this._fullPlayer.destroy();

        this._fullPlayer = null;
        this._smallPlayer = null;
    }

    switchToSmall() {
        // if (this._isFull) {
        //     this.player = this._smallPlayer;
        //     let _oldPlayer = this._fullPlayer;
        //     if (!_oldPlayer.getStopped()) {
        //         this.player.play()
        //     } else {
        //         this._hasStoppedOnSwitch = true;
        //         let _position = this.audioState.globalTime;
        //         this.player.setPosition(_position);
        //     }
        // }
        this.pause()
        console.log('temporary disabled')
    }


    switchToFull() {
        // if (this.audioState.audio) {
        //     this.play()
        // }

        console.log('temporary disabled')
        // if (!this._isFull && this._fullPlayer) {
        //     this.player = this._fullPlayer;
        //     let _oldPlayer = this._smallPlayer;
        //     if (!_oldPlayer.getStopped()) {
        //         this.player.play()
        //     } else {
        //         this._hasStoppedOnSwitch = true;
        //         let _position = this.audioState.globalTime;
        //         this.player.setPosition(_position);
        //     }
        // }
    }

    _renderContent(content) {
        if (this._onRenderContent) {
            this._onRenderContent(content);
        }

        store.dispatch(playerActions.setContentArray(content))
        if (_notifier) _notifier.setContentArray(content)
    }

    _setCurrentTime(value) {
        let _delta = value - this._currentTime;
        if ((_delta > 0.5) || (_delta < 0)) {
            this._currentTime = value;
            store.dispatch(playerActions.setCurrentTime(value))
            if (_notifier) _notifier.setCurrentTime(value)
        }
    }

    _getPlayerOptions() {
        let that = this;

        return {
            designMode: false,
            loader: new Loader(),
            onAudioLoaded: () => {
                let _state = that.player._audioState;

                if (!that._hasStoppedOnSwitch) {
                    if (_state.stopped) {
                        // that.play()
                    }
                }

                store.dispatch(playerActions.setMuteState(_state.muted))
                store.dispatch(playerActions.setRate(_state.playbackRate))
                if (_notifier) {
                    _notifier.setMute(_state.muted)
                    _notifier.setRate(_state.playbackRate)
                }
            },
            onCurrentTimeChanged: (e, isRealTimeChanged) => {
                if (!isRealTimeChanged) return

                if (that._onCurrentTimeChanged) {
                    that._onCurrentTimeChanged(e.globalTime)
                }

                that._setCurrentTime(e.globalTime)
            },
            onVolumeChanged: (value) => {
                store.dispatch(playerActions.setVolume(value))
                if (_notifier) _notifier.setVolume(value)
            },
            onChangeTitles: function (titles) {
                let _title = '',
                    _subTitle = '';

                titles.forEach((item) => {
                    if (item.title) {
                        if (_title !== "") _title += "\n";
                        _title += item.title ? item.title : '';

                        if (_subTitle !== "") _subTitle += "\n";
                        _subTitle += item.title2 ? item.title2 : '';
                    }
                });

                let _result = {
                    title: _title,
                    subTitle: _subTitle
                }

                if (that._onChangeTitle) {
                    that._onChangeTitle(_result)
                }

                store.dispatch(playerActions.setTitle(_result))
                if (_notifier) _notifier.setTitle(_result)
            },
            onChangeContent: (content) => {
                if (that._onChangeContent) {
                    that._onChangeContent(content)
                }

                store.dispatch(playerActions.setCurrentContent(content))
                if (_notifier) _notifier.setCurrentContent(content)
            },
            onAudioInitialized: () => {
                let _state = that.player._audioState;

                if (that._onAudioLoaded) {
                    that._onAudioLoaded({
                        currentTime: _state.currentTime,
                        muted: _state.muted,
                        rate: _state.playbackRate,
                        volume: _state.volume,
                        paused: _state.stopped
                    })
                }

                store.dispatch(playerActions.setMuteState(_state.muted))
                store.dispatch(playerActions.setRate(_state.playbackRate))

                // that._setCurrentTime(_state.currentTime)
                if (_notifier) {
                    _notifier.setMute(_state.muted)
                    _notifier.setRate(_state.playbackRate)
                }

                that._hasStoppedOnSwitch = false
            },
            onCanPlay: (e) => {
                console.log('canPlay in')
                if (e === that.player) {

                    let _state = that.player._audioState;

                    if (!that._hasStoppedOnSwitch) {
                        if (_state.stopped) {
                            console.log('canPLay exec')
                            that.play()
                        }
                    }


                    store.dispatch(playerActions.setMuteState(_state.muted))
                    store.dispatch(playerActions.setRate(_state.playbackRate))
                    if (_notifier) {
                        _notifier.setMute(_state.muted)
                        _notifier.setRate(_state.playbackRate)
                    }
                }
            },
            onPaused: () => {
                store.dispatch(playerActions.pause())
                if (_notifier) _notifier.pause()
            },
            onStarted: () => {
                store.dispatch(playerActions.play())
                if (_notifier) _notifier.play()
            },
            onEnded: () => {
                store.dispatch(playerActions.end())
                if (_notifier) _notifier.end()
            },
            onBuffered: (value) => {
                store.dispatch(playerActions.setBufferedTime(value))
                if (_notifier) _notifier.setBufferedTime(value)
            },
            onError: (e) => {
                if (_notifier) _notifier.error(e)
                console.log(e)
            }
        };
    }

    _readDataProperty(option, e) {
        return new Promise((resolve, reject) => {
            if (option) {
                if ($.isFunction(option)) {
                    option = option(e);
                }
                if ($.isFunction(option.then)) {
                    option.then(function (assets) {
                        resolve(assets);
                    });
                } else {
                    setTimeout(function () {
                        resolve(option);
                    }, 0);
                }
            } else {
                setTimeout(function () {
                    reject();
                }, 0);
            }
        });
    }

    _getAssets(ids) {
        ids = ids || [];
        if (!Array.isArray(ids)) ids = [ids];

        let idsMap = {};

        ids.forEach((id) => {
            idsMap[id] = true
        });

        let result = [];
        this.assetsList.forEach((asset) => {
            if (asset.id in idsMap) {
                result.push(asset);
            }
        });

        return result;
    }

    _findAudio(assets) {
        if (!assets) return null;

        return assets.find((item) => {
            return item.type === 'MP3'
        })
    }

    _loadAudio(audio) {
        return new Promise((resolve, reject) => {
            if (!audio || !audio.content) reject();
            else {
                this._onGetAudio(audio.content)
                    .then(function (data) {
                        resolve({id: audio.id, data: data});
                    })
                    .catch(function (err) {
                        console.error(err);
                        reject(err);
                    });
            }
        });
    }

    _onGetAudio(content) {
        console.log(content)
    }
}

export default (options) => {
    if (!_instance) {
        _instance = new NestedPlayer(options)
    } else {
        _instance._loadOtherLesson(options)
    }

    return _instance
}

export const getInstance = () => {
    return _instance
}

export const loadPlayInfo = (data, initState) => {
    if (!_cancelStartLessonId) {
        if (!_instance) {
            _instance = new NestedPlayer(data, initState)
        } else {
            _instance._loadOtherLesson(data, initState)
        }
    }

    _cancelStartLessonId = 0;
}

export const cancelStarting = (lessonId) => {
    _cancelStartLessonId = lessonId;
    if (_instance) {
        _instance._cancelStarting()
    }
}

export const setSmallViewPort = (div) => {
    smallViewPort = div
    if (_instance) {
        _instance.applyViewPorts()
    }
}

export const setFullViewPort = (div) => {
    fullViewPort = div
    if (_instance) {
        _instance.applyViewPorts()
    }
}

export const clearPlayInfo = () => {
    _cancelStartLessonId = 0;

    if (_instance) {
        _instance.clearPlayInfo()
    }
}

export const clearFullViewPort = (div) => {
    if (_instance) {
        _instance.clearFullViewPort(div)
    }
}

export const setNotifier = (notifier) => {
    _notifier = notifier
}