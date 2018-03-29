import EventEmitter from 'events'
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

class NestedPlayer extends EventEmitter {

    constructor(options) {
        super();
        this._options = this._getPlayerOptions();
        this._fullPlayer = new Player(options.div, this._options);
        this._smallPlayer = new Player(options.smallDiv, this._options);
        this._player = this._fullPlayer;
        this._isFull = true;
        this._isHardStopped = false;
        this._canEmit = true;


        this._applyOptions(options);
        this._fullPlayer.render();
        this._smallPlayer.render();
        if (options.data) {
            this._applyData(options.data)
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

    get lesson() {
        return this._lesson
    }

    get courseUrl() {
        return this._courseUrl;
    }

    _loadOtherLesson(options) {
        this._fullPlayer.initContainer(options.div);
        this._smallPlayer.initContainer(options.smallDiv);

        this._applyOptions(options);
        this._fullPlayer.render();
        this._smallPlayer.render();
        if (options.data) {
            this._applyData(options.data)
        }
    }

    _applyOptions(options) {
        this._isHardStopped = false;
        if (options.data) {
            this.assetsList = options.data.assets;
        }
        this._onRenderCotent = options.onRenderContent;
        this._onCurrentTimeChanged = options.onCurrentTimeChanged;
        this._onChangeTitle = options.onChangeTitle;
        this._onChangeContent = options.onChangeContent;
        this._onAudioLoaded = options.onAudioLoaded;
        this._courseUrl = options.courseUrl;
        this._lesson = options.lesson;
    }

    _applyData(data) {
        this._fullPlayer.setData(data);
        this._smallPlayer.setData(data);

        let content = this._fullPlayer.getLectureContent();
        this._renderContent(content);
    }

    pause() {
        this._isHardStopped = false;
        return this.player.pause()
    }

    play() {
        this.player.play()
        this._isHardStopped = false;
    }

    stop() {
        this.player.pause()
        this._lesson = null
        this._isHardStopped = true;
    }

    setPosition(begin) {
        this.player.setPosition(begin)
    }

    setRate(value) {
        this.player.setRate(value)
    }

    mute() {
        this.player.setMute(true)
    }

    unmute() {
        this.player.setMute(false)
    }

    setVolume(value) {
        this.player.setVolume(value)
    }

    switchToSmall() {
        if (this._isFull) {
            this.player = this._smallPlayer;
            let _oldPlayer = this._fullPlayer;
            this.player.setPosition(_oldPlayer.getPosition());
            if (!_oldPlayer.getStopped()) {
                _oldPlayer.pause()
                    .then(() => {
                        this.player.play()
                    })

            }
        }
    }


    switchToFull() {
        if (!this._isFull) {
            this.player = this._fullPlayer;
            let _oldPlayer = this._smallPlayer;
            this.player.setPosition(_oldPlayer.getPosition());
            if (!_oldPlayer.getStopped()) {
                _oldPlayer.pause()
                    .then(() => {
                    this.player.play();
                    })

            } else {
                let _position = this.audioState.globalTime;
                this.player.setPosition(_position);
            }
        }
    }

    _renderContent(content) {
        this._onRenderCotent(content)
    }

    _getPlayerOptions(assetsList) {
        let that = this;

        return {
            designMode: true,
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
                if (that._onCurrentTimeChanged && that._canEmit) {
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
                        if (html !== "") html += "<br/>";
                        html += item.title;
                    }
                });

                if (that._onChangeTitle && that._canEmit) {
                    that._onChangeTitle(html)
                }
            },
            onChangeContent: (content) => {
                if (that._onChangeContent) {
                    that._onChangeContent(content)
                }

                store.dispatch(playerActions.play())
            },
            onAudioInitialized() {
                if (that._onAudioLoaded) {
                     let _state = that.player._audioState;
                     that._onAudioLoaded({
                         currentTime: _state.currentTime,
                         muted: _state.muted,
                         rate: _state.playbackRate,
                         volume: _state.volume,
                         paused: _state.stopped
                     })
                }

                // that._enableEmits();
            },
            onPaused: () => {
                that.emit('pause');
                store.dispatch(playerActions.pause())
            },
            onStarted: () => {
                that.emit('play');
                store.dispatch(playerActions.play())
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
