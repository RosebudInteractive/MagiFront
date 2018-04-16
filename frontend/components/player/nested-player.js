import $ from 'jquery'

import * as playerActions from '../../actions/player-actions';
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

class NestedPlayer {

    constructor(playingData, initState) {
        this._playingData = null;
        this._fullPlayer = null;
        this._setAssetsList(playingData);
        this.applyViewPorts();
        this._hasStoppedOnSwitch = false;
        this._applyData(playingData)
        this._setInitState(initState);
        this._currentTime = 0;


        let  that = this
        setTimeout(() => {
            fakeClick(function() {
                alert('begin load')
                that.audioState.audio.load();
                // that.play();
            });
        }, 2000)
    }


    applyViewPorts() {
        let _isSmallActive = (this.player) && (this._smallPlayer) && (this.player === this._smallPlayer);



        let _isSameViewPort = (this._fullDiv && fullViewPort) ? this._fullDiv[0].isEqualNode(fullViewPort[0]) : false;
        if (fullViewPort && (!_isSameViewPort || !this._fullPlayer)) {
            this._fullDiv = fullViewPort;
            if (!this._fullPlayer) {
                let _options = this._getPlayerOptions();
                this._fullPlayer = new Player(fullViewPort, _options);
                this._fullPlayer.render();
            } else {
                if ((this._playingData) && (this._fullDiv[0].id === 'player' + this._playingData.id)) {
                    this._fullPlayer.initContainer(this._fullDiv);
                    this._fullPlayer.render();
                    if (this.audioState.audio) {
                        this.play()
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
            this.player.pause();
            this.player = null;
            this._fullPlayer.destroy();
            // this._smallPlayer.destroy();

            this._fullPlayer = null;
            this._smallPlayer = null;

            this._setAssetsList(data);
            this.applyViewPorts();
            this._applyData(data);
            this._setInitState(initState);
            // this.play();
        }

        this._hasStoppedOnSwitch = false;
    }

    _setInitState(state) {
        if (state) {
            this._initState = Object.assign({}, state)
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
        this._hasStoppedOnSwitch = false;
        return this.player.pause()
    }

    play() {
        if (!this._initState) {
            let _state = this.player._audioState;

            store.dispatch(playerActions.setMuteState(_state.muted))

            store.dispatch(playerActions.setRate(_state.playbackRate))
        }

        this.player.play()
            .then(() => {
                if (this._initState) {
                    let _state = Object.assign({}, this._initState);
                    this._initState = null;
                    let _audioState = this.player._audioState;
                    if (_state.currentTime) {
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
                    }
                }
            })

        this._hasStoppedOnSwitch = false;
    }

    stop() {
        this.player.pause()
            .then(() => {
                store.dispatch(playerActions.stop())
                this.player = null;
                this._playingData = null;
            })
        this._hasStoppedOnSwitch = false;

    }

    setPosition(begin) {
        this.player.setPosition(begin)
        // this._smallPlayer.setPosition(begin)
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
        // store.dispatch(playerActions.setVolume(value))
        // store.dispatch(playerActions.setVolume(this.audioState.volume))
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
    }

    _setCurrentTime(value) {
        let _delta = value - this._currentTime;
        if ((_delta > 0.5) || (_delta < 0)) {
            this._currentTime = value;
            store.dispatch(playerActions.setCurrentTime(value))
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
                        that.play()
                    }
                }


                store.dispatch(playerActions.setMuteState(_state.muted))
                store.dispatch(playerActions.setRate(_state.playbackRate))
            },
            onCurrentTimeChanged: (e) => {
                if (that._onCurrentTimeChanged) {
                    that._onCurrentTimeChanged(e.currentTime)
                }

                that._setCurrentTime(e.currentTime)
            },
            onVolumeChanged: (value) => {
                store.dispatch(playerActions.setVolume(value))
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
                store.dispatch(playerActions.setRate(_state.playbackRate))

                // that._setCurrentTime(_state.currentTime)

                that._hasStoppedOnSwitch = false
            },
            onCanPlay: (e) => {
                if (e === that.player) {

                    let _state = that.player._audioState;

                    if (!that._hasStoppedOnSwitch) {
                        if (_state.stopped) {
                            that.play()
                        }
                    }


                    store.dispatch(playerActions.setMuteState(_state.muted))
                    store.dispatch(playerActions.setRate(_state.playbackRate))
                }
            },
            onPaused: () => {
                store.dispatch(playerActions.pause())
            },
            onStarted: () => {
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

function fakeClick(fn) {
    var $a = $('<a href="#" id="fakeClick"></a>');
    $a.bind("click", function(e) {
        e.preventDefault();
        fn();
    });

    $("body").append($a);

    var evt,
        el = $("#fakeClick").get(0);

    if (document.createEvent) {
        evt = document.createEvent("MouseEvents");
        if (evt.initMouseEvent) {
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            el.dispatchEvent(evt);
        }
    }

    $(el).remove();
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
    if (!_instance) {
        _instance = new NestedPlayer(data, initState)
    } else {
        _instance._loadOtherLesson(data, initState)
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
    if (_instance) {
        _instance.clearPlayInfo()
    }
}

export const clearFullViewPort = (div) => {
    if (_instance) {
        _instance.clearFullViewPort(div)
    }
}