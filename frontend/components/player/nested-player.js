import $ from 'jquery'

import Player from "work-shop/player";
import Loader from "work-shop/resource-loader"

var Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.Utils = Utils;

export default class NestedPlayer {
    constructor(data, div) {
        this.o1 = this._getPlayerOptions();
        // let _div = $("#" + div)
        this.pl1 = new Player(div, this.o1);
        // this.pl = this.pl1;
        this.assetsList = data.assets;
        this.pl1.render();

        this.pl1.setData(data);
        let content = this.pl1.getLectureContent();
        this._renderContent(content);
    }

    _renderContent() {
        // var cDiv = $(".text-content");
        // cDiv.empty();
        //
        // var length = 0;
        //
        // for (var i = 0; i < content.length; i++) {
        //     var epContent = content[i];
        //     length += epContent.duration;
        //     var title = $("<div/>")
        //     title.text(epContent.title + " (" + epContent.duration_formated + ")");
        //     cDiv.append(title);
        //     var ul = $("<ul/>");
        //
        //     for (var j = 0; j < epContent.content.length; j++) {
        //         var c = epContent.content[j];
        //         (function (cnt) {
        //             var li = $("<li/>");
        //             li.text(cnt.title);
        //             li.click(function (e) {
        //                 pl.setPosition(cnt.begin);
        //             });
        //             ul.append(li);
        //         })(c);
        //     }
        //
        //     cDiv.append(ul);
        // }
        //
        // var info = $(".general-info");
        // var durStr = Math.trunc(length/60) + ":" + length % 60;
        // info.append("<div>Duration: " + durStr + "</div><br/>");

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
                                        that.pl1.setAudio(audio);
                                        // pl2.setAudio(audio);
                                    });
                            }

                        })
                        .catch((err) => {
                            console.error(err)
                            reject(err);
                        });
                });
            },
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

        // for (let i = 0; i < ids.length; i++) {
        //     idsMap[ids[i]] = true;
        // }

        ids.forEach((id) => {
            idsMap[id] = true
        });

        let result = [];
        // for (var i = 0; i < assetsList.length; i++) {
        //     var asset = assetsList[i];
        //     if (asset.id in idsMap) {
        //         result.push(asset);
        //     }
        // }
        this.assetsList.forEach((asset) => {
            if (asset.id in idsMap) {
                result.push(asset);
            }
        });

        return result;
    }

    _findAudio(assets) {
        if (!assets) return null;

        for (var i = 0; i < assets.length; i++) {
            if (assets[i].type == "MP3") return assets[i];
        }
        return null;
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