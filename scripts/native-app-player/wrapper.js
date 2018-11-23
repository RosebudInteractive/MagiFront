import Player from "work-shop/player";
import Loader from "work-shop/resource-loader";
import 'jquery-ui/jquery-ui';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'
import Platform from 'platform';

// Sentry.init({ dsn: 'https://4fb18e49474641faaeb712d2329f1549@sentry.io/1326933' });

let Utils = {};

let _isAndroid = Platform.os.family === "Android"

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
            this._id = null;
            window[this._playerName] = this;

            this._sendMessageToApp({
                eventType: 'magisteriaPlayer',
                eventName: 'playerLoaded',
                playerObject: 'window.' + this._playerName,
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
        this._setPositionOnPlay = false;


        let gOldOnError = window.onerror;

        window.onerror = (errorMsg, url, lineNumber) => {
            this._sendErrorMessageToApp('unhandled exception: ' + errorMsg)

            if (gOldOnError) {
                return gOldOnError(errorMsg, url, lineNumber);
            }

            return false;
        }
    }

    setData(data, playerId) {
        if (data) {
            this._started = false;
            this._timeChanged = false;
            this._currentTime = 0;

            let _audios = data.episodes.map((item) => {
                return item.audio.file
            });

            Loader.preinitAudio(_audios);

            if (this._player) {
                this._player.pause();
                this._player.destroy();
                this._player = null;
            }

            this._id = playerId || (new Date).getTime()
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
                    this._setPositionOnPlay = true;
                    this._player.setPosition(option.position)
                }
            })
            .catch((e) => {
                console.log(e)

                this._sendErrorMessageToApp(
                    e.message
                )
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

        this._sendMessageToApp({
            eventType: 'magisteriaPlayer',
            eventName: 'playerMessage',
            data: {_delta}
        })

        if ((_delta > 0.5) || (_delta < 0)) {

            this._currentTime = value.globalTime;

            if (this._setPositionOnPlay) {
                this._setPositionOnPlay = false;
                return
            }

            if (!this._timeChanged) {
                this._timeChanged = true;

                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerStarted',
                })
            }

            this._sendMessageToApp({
                eventType: 'magisteriaPlayer',
                eventName: 'onCurrentTimeChanged',
                data: {
                    currentTime: value.currentTime,
                    globalTime: value.globalTime,
                    baseTime: value.baseTime
                },
            })
        }
    }

    _sendMessageToApp(props) {
        props['playerId'] = this._id
        props.host = window.location.href
        if (this._debug) {
            window.postMessage(
                JSON.stringify(props),
                '*'
            )
            console.log(JSON.stringify(props))
        } else if ( _isAndroid) {
            setTimeout(() => {
                window.postMessage(
                    JSON.stringify(props),
                    '*'
                )
            }, 0)
        } else {
            window.postMessage(
                JSON.stringify(props)
            )
        }
    }

    _sendErrorMessageToApp(message) {
        this._sendMessageToApp({
            eventType: 'magisteriaPlayer',
            eventName: 'playerError',
            message: message,
        })
    }

    _getPlayerOptions() {
        return {
            designMode: false,
            loader: new Loader(this._getLoaderOptions()),
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
                })
            },
            onSetData: (data) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'dataIsSet',
                    _nativeAppDataUuid: data,
                })
            },
            onElementPlay: (fileName) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'assetShowed',
                    data: {
                        fileName,
                    },
                })
            },
            onElementStop: (fileName) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'assetRemoved',
                    data: {
                        fileName,
                    },
                })
            },
            onChangeTitles: (titles) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'onChangeTitles',
                    data: {
                        titles,
                    },
                })
            },
            onChangeContent: function (content) {
                console.log(content);
            },
            onPaused: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerPaused',
                })
            },
            onEnded: () => {
                this._ended = true;
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerStopped',
                })
            },
            onStarted: () => {
                this._started = true
            },
            onError: (e) => {
                this._sendErrorMessageToApp(
                    'player error: ' + JSON.stringify(e.target.error.message)
                )
                // Sentry.captureException(e);
            },
            onCanPlay: () => {
                if (!this._started) {
                    this._sendMessageToApp({
                        eventType: 'magisteriaPlayer',
                        eventName: 'playerCanPlay',
                    })
                }
            },
            onBuffered: (value) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerBuffered',
                    value: value,
                })
            },
            onWaiting: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'playerBuffering',
                })
            },
            onPlaying: () => {
                if (this._timeChanged) {
                    this._sendMessageToApp({
                        eventType: 'magisteriaPlayer',
                        eventName: 'playerStarted',
                    })
                }
            },
        };
    }

    _getLoaderOptions() {
        return {
            onError: (err) => {
                this._sendErrorMessageToApp(
                    'loader error: ' + JSON.stringify(err)
                )
                // Sentry.captureException(err);
            }
        }
    }
}
