import Player from "work-shop/player";
import ExternalPlayer from "work-shop/external-player";
import Loader from "work-shop/resource-loader";
import 'jquery-ui/jquery-ui';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'
import {sendMessage} from "./message-handler";

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
            this._externalPlayer = !!options.externalPlayer;
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

        this.state = {
            needSeek: false,
            seekToPosition: 0,

        };
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

    setData({data, playerId, position, externalPlayer}) {
        if (data) {
            this._started = false;
            this._timeChanged = false;
            this._currentTime = 0;

            if (externalPlayer !== undefined) {
                this._externalPlayer = externalPlayer
            }

            let _audios = data.episodes.map((item) => {
                return item.audio.file
            });

            if (!this._externalPlayer) {
                Loader.preinitAudio(_audios);
            }

            if (this._player) {
                this._player.pause();
                this._player.destroy();
                this._player = null;
            }

            this.state.needSeek = !!position;
            this.state.seekToPosition = +position;

            this._id = playerId || (new Date).getTime()
            this._player = this._externalPlayer ? new ExternalPlayer(this._div, this._getPlayerOptions()) :  new Player(this._div, this._getPlayerOptions())
            this._player.render();
            this._player.setData(data);

            if (this._externalPlayer && this.state.needSeek) {
                this._player.onChangePosition(this.state.seekToPosition)
                this.state.needSeek = false;
                this.state.seekToPosition = 0;
            }
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
                // console.log(e)

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
        sendMessage(props)
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
                if (this.state.needSeek) {
                    this.state.needSeek = false;
                    this.state.seekToPosition = 0;
                }

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
                // console.log(content);
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
            },
            onCanPlay: () => {
                if (this.state.needSeek) {
                    this._player.setPosition(this.state.seekToPosition)
                }

                if (!this._started && !this.state.needSeek) {
                    this._sendMessageToApp({
                        eventType: 'magisteriaPlayer',
                        eventName: 'playerCanPlay',
                    })
                }
            },
            onCanPlayThrough: () => {
                if (this.state.needSeek) {
                    this._player.setPosition(this.state.seekToPosition)
                }

                if (!this._started && !this.state.needSeek) {
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
            onAbort: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'ABORT',
                })
            },
            onStalled: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'STALLED',
                })
            },
            onSuspend: () => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'Suspend',
                })
            },
            // onMessage: (message) => {
            //     this._sendMessageToApp({
            //         eventType: 'magisteriaPlayer',
            //         eventName: 'Message',
            //         data: {
            //             message,
            //         },
            //     })
            // }
        };
    }

    _getLoaderOptions() {
        return {
            isExternal: this._externalPlayer,
            onError: (err) => {
                this._sendErrorMessageToApp(
                    'loader error: ' + JSON.stringify(err)
                )
                // Sentry.captureException(err);
            },
            onAssetMissing: (data) => {
                this._sendMessageToApp({
                    eventType: 'magisteriaPlayer',
                    eventName: 'assetMissing',
                    value: data,
                })
            }

        }
    }

    onChangePosition({ playerId, position }) {
        if (!this._player || playerId !== this._id) {
          return
        }

        this._player.onChangePosition(position)
    }

    onEnd({ playerId }) {
        if (!this._player || playerId !== this._id) {
          return
        }

        this._player.onEnd()
    }
}
