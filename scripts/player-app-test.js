
import Player from "work-shop/player";
import Loader from "work-shop/resource-loader";
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import '../css/font-awesome.css'
import '../css/general-player.css'
import 'jquery-ui/jquery-ui.min.css';
import 'jquery-ui/jquery-ui.structure.min.css';

var Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.Utils = Utils;

(function ($) {
    $(document).ready(function () {
        let _playerInited = false;

        var playerOptions = getPlayerOptions();
        var player = new Player($("#player"), playerOptions);

        var playerNameInWindow = 'player' + (new Date).getTime()

        window[playerNameInWindow] = player;

        window.postMessage(
            JSON.stringify({
                eventType: 'magisteriaPlayer',
                eventName: 'playerLoaded',
                playerObject: 'window.' + playerNameInWindow
            }), '*'
        )

        function getPlayerOptions() {
            return {
                designMode: true,
                loader: new Loader(),
                onCurrentTimeChanged: function onCurrentTimeChanged(audioState, value) {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'onCurrentTimeChanged',
                            data: {
                                currentTime: audioState.currentTime,
                                globalTime: audioState.globalTime,
                                baseTime: audioState.baseTime
                            }
                        }), '*'
                    )
                },
                onAudioLoaded: function () {
                },
                onSetPosition: function onSetPosition(audioState) {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'onSetPosition',
                            data: {
                                currentTime: audioState.currentTime,
                                globalTime: audioState.globalTime,
                                baseTime: audioState.baseTime
                            }
                        }), '*'
                    )
                },
                onSetData: (data) => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'dataIsSet',
                            _nativeAppDataUuid: data
                        }), '*'
                    );
                },
                onElementPlay: () => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerPlaying'
                        }), '*'
                    )
                },
                onElementStop: () => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerStopped'
                        }), '*'
                    )
                },
                onFocused: function () {
                },
                onSetTextData: function () {
                },
                onAddElement: function () {
                },
                onChangeTitles: function (titles) {
                    var html = "";
                    for (var i = 0; i < titles.length; i++) {
                        if (titles[i].title) {
                            if (html != "") html += "<br/>";
                            html += titles[i].title;
                        }
                    }

                    $("#titles-place").html(html);
                },
                onChangeContent: function (content) {
                    console.log(content);
                },
                onPaused: function () {
                    console.log("paused event handler")
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerPaused'
                        }), '*'
                    )
                },
                onEnded: function () {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerStopped'
                        }), '*'
                    )
                },
                onStarted: function () {
                    console.log("started event handler")
                },
                onError: function (e) {
                    console.error("playback error. player was suspended", e);
                },
                onCanPlay: () => {
                    player.play()
                },
            };
        }

        function getData(id) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: "/api/lessons/play/" + id,
                    type: "GET",
                    dataType: "json",
                    responseType: 'json',
                    success: function (result) {
                        resolve(result);
                    },
                    fail: function (err) {
                        reject(err);
                    }
                });
            })
        }

        $(".ctl-buttons").find("button").click(function () {
            let role = $(this).attr("role");

            if (role === "play") {
                if (!_playerInited) {
                    getData(200)
                        .then((data) => {
                            player.render();
                            player.setData(data)
                            _playerInited = true;
                        })
                } else {
                    player.play()
                }


            }
            else if (role === "pause") player.pause();
            else {
                let curr = player.getCurrent();
                console.log(curr);
            }
        })
    });
})(jQuery)
