import $ from 'jquery'

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

class NestedPlayer {

    constructor(options) {
        this.o1 = this._getPlayerOptions();
        this.pl1 = new Player(options.div, this.o1);
        this.pl = this.pl1;

        this._applyOptions(options);
        this.pl1.render();
        this._applyData(options.data);
    }

    _loadOtherLesson(options) {
        this.pl1.initContainer(options.div);

        this._applyOptions(options);
        this.pl1.render();
        this._applyData(options.data);
    }

    _applyOptions(options) {
        this.assetsList = options.data.assets;
        this._onRenderCotent = options.onRenderContent;
        this._onCurrentTimeChanged = options.onCurrentTimeChanged;
        this._onChangeTitle = options.onChangeTitle;
        this._onChangeContent = options.onChangeContent;
    }

    _applyData(data) {
        this.pl1.setData(data);

        let content = this.pl1.getLectureContent();
        this._renderContent(content);
    }

    pause() {
        this.pl.pause()
    }

    play() {
        this.pl.play()
    }

    setPosition(begin) {
        this.pl.setPosition(begin)
    }

    setRate(value) {
        this.pl.setRate(value)
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
            onCurrentTimeChanged: (e) => {
                if (that._onCurrentTimeChanged) {
                    that._onCurrentTimeChanged(e.currentTime)
                }
            },
            onAudioLoaded: function () {
                that.pl.play()
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
            onChangeContent: (content) => {
                if (this._onChangeContent) {
                    this._onChangeContent(content)
                }
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

export default (options) => {
    if (!_instance) {
        _instance = new NestedPlayer(options)
    } else {
        _instance._loadOtherLesson(options)
    }

    return _instance
}