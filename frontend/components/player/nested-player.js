import EventEmitter from 'events'
import $ from 'jquery'

import * as playerActions from '../../actions/player-actions';
import * as lessonActions from '../../actions/lesson-actions';
import {store} from '../../store/configureStore';

import Player from "work-shop/player";
import Loader from "work-shop/resource-loader"
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'work-shop/player-fork.css'

let _instance = null;

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

class NestedPlayer extends EventEmitter {

    constructor(playingData) {
        super();
        this._playingData = null;
        this._fullPlayer = null;
        this._setAssetsList(playingData);
        this.applyViewPorts();
        this._hasStoppedOnSwitch = false;
        this._applyData(playingData)
    }


    applyViewPorts() {
        let _isSmallActive = (this.player) && (this._smallPlayer) && (this.player === this._smallPlayer);

        let _options = this._getPlayerOptions();

        if (fullViewPort && (this._fullDiv !== fullViewPort)) {
            this._fullDiv = fullViewPort;
            if (!this._fullPlayer) {
                this._fullPlayer = new Player(fullViewPort, _options);
                this._fullPlayer.render();
            } else {
                if (this._playingData) {
                    this._fullPlayer.initContainer(this._fullDiv);
                    this._setAssetsList(this._playingData);
                    this._fullPlayer.render();
                    this._applyData(this._playingData)
                }
            }

        }

        if (smallViewPort && ((this._smallDiv !== smallViewPort) || !this._smallPlayer)) {
            this._smallDiv = smallViewPort;
            this._smallPlayer = new Player(smallViewPort, _options);
            this._smallPlayer.render();
        }

        this.player = _isSmallActive ?
            this._smallPlayer
            :
            this._fullPlayer ?
                this._fullPlayer
                :
                this._smallPlayer;
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

    _loadOtherLesson(data) {

        if (data) {
            this._setAssetsList(data);
            this.applyViewPorts();
            this._applyData(data)
        }

        this._hasStoppedOnSwitch = false;
    }

    _setAssetsList(data) {
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
        this._playingData = data;
    }

    pause() {
        this._hasStoppedOnSwitch = false;
        return this.player.pause()
    }

    play() {
        this.player.play()
        this._hasStoppedOnSwitch = false;
    }

    stop() {
        this.player.pause()
            .then(() => {
                store.dispatch(playerActions.stop())
                store.dispatch(lessonActions.clearLessonPlayInfo());
                this._fullPlayer = null;
                this._smallPlayer = null;
                this._playingData = null;
            })
        this._hasStoppedOnSwitch = false;

    }

    setPosition(begin) {
        this.player.setPosition(begin)
    }

    setRate(value) {
        this.player.setRate(value)
        store.dispatch(playerActions.setRate(this.audioState.playbackRate))
    }

    mute() {
        this.player.setMute(true);
        store.dispatch(playerActions.setMuteState(this.audioState.muted))
    }

    unmute() {
        this.player.setMute(false);
        store.dispatch(playerActions.setMuteState(this.audioState.muted))
    }

    setVolume(value) {
        this.player.setVolume(value);
        store.dispatch(playerActions.setVolume(this.audioState.volume))
    }

    switchToSmall() {
        if (this._isFull) {
            this.player = this._smallPlayer;
            let _oldPlayer = this._fullPlayer;
            this.player.setPosition(_oldPlayer.getPosition());
            if (!_oldPlayer.getStopped()) {
                this.player.play()
            } else {
                this._hasStoppedOnSwitch = true;
                let _position = this.audioState.globalTime;
                this.player.setPosition(_position);
            }
        }
    }


    switchToFull() {
        if (!this._isFull) {
            this.player = this._fullPlayer;
            let _oldPlayer = this._smallPlayer;
            if (!_oldPlayer.getStopped()) {
                this.player.play()
            } else {
                this._hasStoppedOnSwitch = true;
                let _position = this.audioState.globalTime;
                this.player.setPosition(_position);
            }
        }
    }

    _renderContent(content) {
        if (this._onRenderContent) {
            this._onRenderContent(content);
        }

        store.dispatch(playerActions.setContentArray(content))
    }

    _getPlayerOptions(assetsList) {
        let that = this;

        return {
            designMode: false,
            loader: new Loader(),
            onGetAssets: (e) => {
                return new Promise((resolve, reject) => {
                    that._readDataProperty(that._getAssets, e)
                        .then((assets) => {
                            resolve(assets);

                            let audioObj = that._findAudio(assetsList);
                            if (audioObj) {
                                that._loadAudio(audioObj)
                                    .then((audio) => {
                                        that._fullPlayer.setAudio(audio);
                                        that._smallPlayer.setAudio(audio);
                                    });
                            }

                        })
                        .catch((err) => {
                            console.error(err)
                            reject(err);
                        });
                });
            },
            onCurrentTimeChanged: (e) => {
                if (that._onCurrentTimeChanged) {
                    that._onCurrentTimeChanged(e.currentTime)
                }

                store.dispatch(playerActions.setCurrentTime(e.currentTime))
            },
            onSetPosition: function () {
            },
            onFocused: function () {
            },
            onSetTextData: function () {
            },
            onAddElement: function () {
            },
            onChangeTitles: function (titles) {
                let html = "";
                titles.forEach((item) => {
                    if (item.title) {
                        if (html !== "") html += "\n";
                        html += item.title;
                    }
                });

                if (that._onChangeTitle) {
                    that._onChangeTitle(html)
                }

                store.dispatch(playerActions.setTitle(html))
            },
            onChangeContent: (content) => {
                if (that._onChangeContent) {
                    that._onChangeContent(content)
                }

                store.dispatch(playerActions.setCurrentContent(content))
            },
            onAudioInitialized() {
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
                store.dispatch(playerActions.setVolume(_state.volume))
                store.dispatch(playerActions.setRate(_state.playbackRate))
                store.dispatch(playerActions.setCurrentTime(_state.currentTime))

                // that.play()
                that._hasStoppedOnSwitch = false
            },
            onCanPlay: () => {
                let _state = that.player._audioState;

                if (!that._hasStoppedOnSwitch) {
                    if (_state.stopped) {
                        that.play()
                    }
                }

                store.dispatch(playerActions.setMuteState(_state.muted))
                store.dispatch(playerActions.setVolume(_state.volume))
                store.dispatch(playerActions.setRate(_state.playbackRate))
                // store.dispatch(playerActions.setCurrentTime(_state.currentTime))
            },
            onPaused: () => {
                that.emit('pause');
                store.dispatch(playerActions.pause())
            },
            onStarted: () => {
                that.emit('play');
                store.dispatch(playerActions.play())
            },
            onEnded: () => {
                store.dispatch(playerActions.end())
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

export const loadPlayInfo = (data) => {
    if (!_instance) {
        _instance = new NestedPlayer(data)
    } else {
        _instance._loadOtherLesson(data)
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