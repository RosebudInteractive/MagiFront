import Player from "work-shop/player";
import Loader from "work-shop/resource-loader";
import 'jquery-ui/jquery-ui';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'

let Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.Utils = Utils;

export default class NativeAppPlayer {
    constructor(options) {
        this._div = $("#player");
        this._debug = options && options.debug;
        if (this._div && this._div.length) {

            this._playerName = 'magisteriaPlayer';
            this._id = (new Date).getTime();
            window[this._playerName] = this;

            this._sendMessageToApp({
                eventType: 'magisteriaPlayer',
                eventName: 'playerLoaded',
                playerObject: 'window.' + this._playerName,
                playerId: this._id,
            })
        } else {
            this._sendMessageToApp({
                eventType: 'magisteriaPlayer',
                eventName: 'playerLoadedError',
                message: "Can not found render container"
            })
        }

        this._ended = false;
        this._currentTime = 0;
        this._timeChanged = false;
    }

    setData(data) {
        if (data) {
            this._started = false;
            this._timeChanged = false;
            this._currentTime = 0;

            let _audios =  data.episodes.map((item) => {
                return item.audio.file
            });

            Loader.preinitAudio(_audios);

            if (this._player) {
                this._player.pause();
                this._player.destroy();
                this._player = null;
            }

            if (this._player) {
                this._player.destroy();
                this._id = (new Date).getTime()
            }
            this._player = new Player(this._div, this._getPlayerOptions())
            this._player.render();
            this._player.setData(data);
        }
    }

    play(option) {
        if (!option || (option.playerId !== this._id) || (!this._player)) return

        if (!this._timeChanged) {
            this._sendMessageToApp({
                eventType: 'magisteriaPlayer',
                eventName: 'playerBuffering',
            })
        }

        if (this._ended) {
            this._player.setPosition(0)
        }

        this._player.play()
            .then(() => {
                this._ended = false;

                if (option && (option.position !== undefined)) {
                    this._player.setPosition(option.position)
                }
            })
            .catch((e) => {
                console.log(e)
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerError',
                })
            })
    }

    pause(options) {
        if (options && (options.playerId === this._id) && this._player) {
            this._player.pause();
        }
    }

    setPlaybackSpeed(options) {
        if (options && (options.playerId === this._id) && this._player) {
            this._player.setRate(options.rate)
        }
    }

    seek(options) {
        if (options && (options.playerId === this._id) && this._player) {
            this._player.setPosition(options.position)
        }
    }

    _setCurrentTime(value) {
        let _delta = value.globalTime - this._currentTime;
        if ((_delta > 0.5) || (_delta < 0)) {

            if (!this._timeChanged) {
                this._timeChanged = true;

                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerStarted',
                })
            }

            this._currentTime = value.globalTime;

            this._sendMessageToApp({
                eventType: 'magisteriaPlayer',
                eventName: 'onCurrentTimeChanged',
                data: {
                    currentTime: value.currentTime,
                    globalTime: value.globalTime,
                    baseTime: value.baseTime
                }
            })
        }
    }

    _sendMessageToApp(props) {
        if (this._debug) {
            window.postMessage(
                JSON.stringify(props),
                '*'
            )
            console.log(JSON.stringify(props))
        } else {
            window.postMessage(
                JSON.stringify(props)
            )
        }
    }

    _getPlayerOptions() {
        return {
            designMode: false,
            loader: new Loader(),
            onCurrentTimeChanged: (audioState, isRealTimeChanged) => {
                if (!isRealTimeChanged) return

                this._setCurrentTime(audioState)
            },
            onSetPosition: (audioState) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'onSeeked',
                    data: {
                        currentTime: audioState.currentTime,
                        globalTime: audioState.globalTime,
                        baseTime: audioState.baseTime
                    },
                    playerId: this._id,
                })
            },
            onSetData: (data) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'dataIsSet',
                    _nativeAppDataUuid: data,
                    playerId: this._id,
                })
            },
            onElementPlay: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'assetShowed',
                    playerId: this._id,
                })
            },
            onElementStop: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'assetRemoved',
                    playerId: this._id,
                })
            },
            onChangeTitles: (titles) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'onChangeTitles',
                    data: {
                        titles,
                    },
                    playerId: this._id,
                })
            },
            onChangeContent: function (content) {
                console.log(content);
            },
            onPaused: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerPaused',
                    playerId: this._id,
                })
            },
            onEnded: () => {
                this._ended = true;
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerStopped',
                    playerId: this._id,
                })
            },
            onStarted: () => { this._started = true },
            onError: (e) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerError',
                    message: e.message,
                    playerId: this._id,
                })
            },
            onCanPlay: () => {
                if (!this._started) {
                    this._sendMessageToApp({
                        eventType: 'magisteriaPlayer',
                        eventName: 'playerCanPlay',
                        playerId: this._id,
                    })
                }
            },
            onBuffered: (value) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerBuffered',
                    value: value,
                    playerId: this._id,
                })
            },
            onWaiting: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerBuffering',
                    playerId: this._id,
                })
            },
            onPlaying: () => {
                if (this._timeChanged) {
                    this._sendMessageToApp({
                        eventType: 'magisteriaPlayer',
                        eventName: 'playerStarted',
                        playerId: this._id,
                    })
                }
            },
        };
    }
}
