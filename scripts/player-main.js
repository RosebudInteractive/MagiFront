/**
 * Created by levan.kiknadze on 06/12/2017.
 */
requirejs.config({
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

var Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}


$(document).ready(function () {
    require(["work-shop/player", "work-shop/resource-loader"], function (Player, Loader) {

        var o1 = getPlayerOptions();
        //var o2 = getPlayerOptions();
        //var o3 = getPlayerOptions();
        var pl1 = new Player($("#pl1"), o1);
        //var pl2 = new Player($("#pl2"), o2);
        //var pl3 = new Player($("#pl3"), o3);

        var pl = pl1;

        $.ajax({
            url: "/genData",
            type: "GET",
            dataType: "json",
            responseType: 'json',
            success: function (result) {
                pl1.render();
                //pl2.render();
                //pl3.render();

                pl1.setData(result);
                //pl2.setData(result);
                //pl3.setData(result);

                var content = pl1.getLectureContent();
                renderContent(content);
            },
            fail: function () {
                console.error(err);
            }
        });

        function getPlayerOptions() {
            var that = this;
            return {
                designMode: true,
                loader: new Loader(),
                onGetAssets: function (e) {
                    return new Promise((resolve, reject) => {
                        readDataProperty(getAssets, e).then((assets) => {
                            resolve(assets);

                            var audioObj = findAudio(assetsList);
                            if (audioObj) {
                                loadAudio(audioObj).then(function (audio) {
                                    pl1.setAudio(audio);
                                    pl2.setAudio(audio);
                                    pl3.setAudio(audio);
                                });
                            }

                        }).catch((err) => {
                            console.error(err)
                            reject(err);
                        });
                    });
                },
                onCurrentTimeChanged: function (e) {
                },
                onAudioLoaded: function (e) {
                },
                onSetPosition: function (e) {
                },
                onFocused: function (e) {
                },
                onSetTextData: function (e) {
                },
                onAddElement: function (e) {
                }
            };
        }

        function readDataProperty(option, e) {
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

        function loadAudio(audio) {
            return new Promise((resolve, reject) => {
                if (!audio || !audio.content) reject();
                else {
                    onGetAudio(audio.content)
                        .then(function (data) {
                            resolve({id: audio.id, data: data});
                        }).catch(function (err) {
                            console.error(err);
                            reject(err);
                        });
                }
            });
        }


        function getAssets(ids) {
            ids = ids || [];
            if (!Array.isArray(ids)) ids = [ids];

            var idsMap = {};

            for (var i = 0; i < ids.length; i++) {
                idsMap[ids[i]] = true;
            }

            var result = [];
            for (var i = 0; i < assetsList.length; i++) {
                var asset = assetsList[i];
                if (asset.id in idsMap) {
                    result.push(asset);
                }
            }

            return result;
        }

        function findAudio(assets) {
            if (!assets) return null;
            for (var i = 0; i < assets.length; i++) {
                if (assets[i].type == "MP3") return assets[i];
            }
            return null;
        }

        function renderContent(content) {
            var ul = $(".text-content").find("ul");
            ul.empty();
            for (var i = 0; i < content.length; i++) {
                c = content[i];
                (function (cnt) {
                    var li = $("<li/>");
                    li.text(cnt.title);
                    li.click(function (e) {
                        pl.setPosition(cnt.begin);
                    });
                    ul.append(li);
                })(c);
            }
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

        $(".ctl-buttons").find("input[role='position']").change(function () {
            var v = $(this).val();
            pl.setPosition(+v || 0);
        });

        $(".ctl-buttons").find("select[role='player']").change(function () {
            var plNum = $(this).find("option:selected").val();
            if (+plNum == 1) pl = pl1;
            else if (+plNum == 2) pl = pl2;
            else pl = pl3;
        });

        $(".ctl-buttons").find("input[role='video']").change(function () {
            var v = $(this).prop("checked");
            if (!!v) pl.setVideoOn();
            else pl.setVideoOff()
        });

        $(".ctl-buttons").find("input[role='lecture-id']").change(function () {
            var v = $(this).val();
            getData(v)
                .then((result) => {
                    pl.setData(result);
                    var content = pl.getLectureContent();
                    renderContent(content);

                })
                .catch((err) => {
                    console.error(err);
                })
        });

    });
});
