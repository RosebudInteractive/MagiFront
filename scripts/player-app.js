import Player from "work-shop/player";
import Loader from "work-shop/resource-loader";
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'

import 'script-lib/../widgets/work-shop/work-shop-custom.css'
import 'script-lib/../widgets/work-shop/player.css'
import 'script-lib/../widgets/work-shop/player-for-native-app.css'
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
        var playerOptions = getPlayerOptions();
        var player = new Player($("#player"), playerOptions);

        var playerNameInWindow = 'player' + (new Date).getTime()

        window[playerNameInWindow] = player;

        window.postMessage(
          JSON.stringify({
            eventType: 'magisteriaPlayer',
            eventName: 'playerLoaded',
            playerObject: 'window.' + playerNameInWindow
          })
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
                    })
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
                    })
                  )
                },
                onSetData: (data) => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'dataIsSet',
                            _nativeAppDataUuid: data
                        })
                    );
                },
                onElementPlay: () => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerPlaying'
                        })
                    )
                },
                onElementStop: () => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerStopped'
                        })
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
                      })
                    )
                },
                onEnded: function() {
                  window.postMessage(
                    JSON.stringify({
                      eventType: 'magisteriaPlayer',
                      eventName: 'playerStopped'
                    })
                  )
                },
                onStarted: function () {
                    console.log("started event handler")
                },
                onError: function (e) {
                    console.error("playback error. player was suspended", e);
                },
                onCanPlay: () => {
                    window.postMessage(
                        JSON.stringify({
                            eventType: 'magisteriaPlayer',
                            eventName: 'playerCanPlay'
                        })
                    )
                },
            };
        }

        function renderContent(content) {
            var cDiv = $(".text-content");
            cDiv.empty();

            var length = 0;

            for (var i = 0; i < content.length; i++) {
                var epContent = content[i];
                length += epContent.duration;
                var title = $("<div/>")
                title.text(epContent.title + " (" + epContent.duration_formated + ")");
                cDiv.append(title);
                var ul = $("<ul/>");

                for (var j = 0; j < epContent.content.length; j++) {
                    var c = epContent.content[j];
                    (function (cnt) {
                        var li = $("<li/>");
                        li.text(cnt.title);
                        li.click(function () {
                            pl.setPosition(cnt.begin);
                        });
                        ul.append(li);
                    })(c);
                }

                cDiv.append(ul);
            }

            var info = $(".general-info");
            var durStr = Math.trunc(length/60) + ":" + length % 60;
            info.append("<div>Duration: " + durStr + "</div><br/>");

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
            var role = $(this).attr("role");

            if (role == "play") pl.play();
            else if (role == "pause") pl.pause();
            else {
                var curr = pl.getCurrent();
                console.log(curr);
            }
        })

        $(".ctl-buttons").find("select[role='rate']").change(function () {
            var rate = $(this).find("option:selected").val();
            pl.setRate(rate);
        });

        $(".ctl-buttons").find("select[role='volume']").change(function () {
            var v = $(this).find("option:selected").val();
            pl.setVolume(v);
        });

        $(".ctl-buttons").find("input[role='mute']").change(function () {
            var v = $(this).prop("checked");
            pl.setMute(!v);
        });

        $(".ctl-buttons").find("input[role='position-btn']").click(function () {
            var v = $(".ctl-buttons").find("input[role='position']").val();
            pl.setPosition(+v || 0);
        });

        $(".ctl-buttons").find("select[role='player']").change(function () {
            var plNum = $(this).find("option:selected").val();
            var oldPl = null;
            if (+plNum == 1) {
                pl = pl1;
                oldPl = pl2;
            }
            else {
                pl = pl2;
                oldPl = pl1;
            }

            pl.setPosition(oldPl.getPosition());
            if (!oldPl.getStopped()) {
                oldPl.pause();
                pl.play();
            }
        });

        $(".ctl-buttons").find("input[role='video']").change(function () {
            var v = $(this).prop("checked");
            if (!!v) pl.setVideoOn();
            else pl.setVideoOff()
        });

        $(".ctl-buttons").find("input[role='lecture-id-btn']").click(function () {
            var v = $(".ctl-buttons").find("input[role='lecture-id']").val();
            getData(v)
                .then((result) => {
                    pl1.setData(result);
                    pl2.setData(result);
                    var content = pl.getLectureContent();
                    renderContent(content);

                })
                .catch((err) => {
                    console.error(err);
                })
        });

        // });
    });
})(jQuery)
