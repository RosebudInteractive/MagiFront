/**
 * Created by levan.kiknadze on 06/12/2017.
 */
/*requirejs.config({
    baseUrl: 'scripts',
    nodeRequire: require,
    paths: {
        "text": '/scripts/lib/text',
        "underscore": '/scripts/lib/underscore',
        "lodash": '/scripts/lib/lodash.min',
        "template": '/scripts/lib/template',
        "work-shop": '/scripts/widgets/work-shop'
    }
});
*/
import Player from "work-shop/player";
import Loader from "work-shop/resource-loader";
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'

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
        // require(["work-shop/player", "work-shop/resource-loader"], function (Player, Loader) {


        var o1 = getPlayerOptions();
        //var o2 = getPlayerOptions();
        //var o3 = getPlayerOptions();
        var pl1 = new Player($("#pl1"), o1);
        var pl2 = new Player($("#pl2"), o1);
        //var pl3 = new Player($("#pl3"), o3);

        var pl = pl1;

        window.player = pl;

        $.ajax({
            url: "/genData",
            type: "GET",
            dataType: "json",
            responseType: 'json',
            success: function (result) {
                pl1.render();
                pl2.render();
                //pl3.render();

                pl1.setData(result);
                pl2.setData(result);
                //pl3.setData(result);

                var content = pl1.getLectureContent();
                renderContent(content);
            },
            fail: function (err) {
                console.error(err);
            }
        });

        function getPlayerOptions() {
            return {
                designMode: true,
                loader: new Loader(),
                onCurrentTimeChanged: function () {
                },
                onAudioLoaded: function () {
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
                    },
                    onStarted: function () {
                        console.log("started event handler")
                    },
                    onError: function (e) {
                        console.error("playback error. player was suspended", e);
                    }

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
