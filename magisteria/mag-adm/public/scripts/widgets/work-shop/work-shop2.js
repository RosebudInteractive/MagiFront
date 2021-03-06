/**
 * Created by levan.kiknadze on 19/05/2017.
 *
 * Requirements:
 * 1. jquery-1.12.4
 * 2. jquery-ui
 * 3. requirejs
 * 4. template
 * 5. text
 * 6. underscore
 *
 * Using notes:
 * 1. Define  "work-shop" in require config paths
 *    like this: "work-shop"  : '/scripts/widgets/work-shop'
 * 2. Call require and pass path to main module in parameters then in
 *    callback create instance of WorkShop class:
 *    require(["work-shop/work-shop"], function (WS) {
 *       var ws = new WS();
 *    });
 * 3. make reference in tour html page to work-shop.css
 * 4. make reference to jQuery, jQurey-UI and require in your html page
 *
 */

import CWSBase from "./ws-base";
import CWSAssets from "./ws-assets";
import CWSTracks from "./ws-tracks";
import CWSPlayer from "./player-design";
import CWSPropEditorImage from "./ws-prop-editor-image";
import CWSPropEditorText from "./ws-prop-editor-text";
import Loader from "./resource-loader-design";
import tpl from 'text!./templates/work-shop.html';

//define(
//    ["./ws-base", "./ws-assets", "./ws-tracks", "./player-design", "./ws-prop-editor-image",
//      "./ws-prop-editor-text", "./resource-loader-design", 'text!./templates/work-shop.html'],
//    function (CWSBase, CWSAssets, CWSTracks, CWSPlayer, CWSPropEditorImage, CWSPropEditorText, Loader, tpl) {
export default class CWorkShop extends CWSBase {

    constructor(container, options) {
        super(container, tpl);
        options.assets.data = this._getAssets.bind(this);
        options.tracks.data = this._getTracks.bind(this);
        this._options = options;
        this._data = {};
    }


    createItem() {
        super.createItem();
        this._container.append($(CWorkShop.template("work-shop"))).attr("tabindex", "-1");
        this._assetsContainer = this._container.find(".ws-assets");
        this._tracksContainer = this._container.find(".ws-tracks-content");
        this._playerContainer = this._container.find(".ws-player-place");
        this._propsContainer = this._container.find(".ws-props-content");
        this._assetsWidget = new CWSAssets(this._assetsContainer, this._getAssetsOptions());
        this._tracksWidget = new CWSTracks(this._tracksContainer, this._getTracksOptions());
        this._playerWidget = new CWSPlayer(this._playerContainer, this._getPlayerOptions());

        this._titles = $(CWorkShop.template("sub-titles"));
        this._playerContainer.parent().append(this._titles);
        this._titles.hide();

        this._setEvents();

        this._readData();
    }

    _readData() {
        if (this._options.data) {
            this._readDataProperty(this._options.data)
                .then(result => {
                    this._correctData(result);
                    this._playerWidget.render();
                    this._playerWidget.setData(result);
                    this._data = result;
                    this._makeTracks(result.episodes);
                    this.render();
                })
                .catch(err => {
                    console.error(err);
                })
        }
    }

    _makeTracks(episodes) {
        for (let i = 0; i < episodes.length; i++) {
            let episode = episodes[i];
            let start = 0;
            let tracks = [];
            let tracksIdx = {};
            for (let j = 0; j < episode.elements.length; j++) {
                let el = episode.elements[j];
                let tId = el.content.track;
                let track = null;
                if (tracksIdx[tId] === undefined) {
                    track = {id : tId, elements: []};
                    tracksIdx[tId] = tracks.length;
                    tracks.push(track);
                } else {
                    track = tracks[tracksIdx[tId]];
                }

                track.elements.push(el);
                el.start = start + el.start;
            }

            tracks.sort((a, b) => {
                return Math.sign(a.id - b.id);
            });

            episode.tracks = tracks;
            episode.tracksIdx = tracksIdx;
        }
    }

    _setEvents() {
        this._container.keydown((e) => {
            if ((e.keyCode == 46 || e.keyCode == 8) && this._container.is(":focus"))
                this._tracksWidget.deleteFocused();
            else if (e.keyCode == 32) {
                let audioState = this._playerWidget.getAudioState();
                if (audioState.stopped) {
                    this._playerWidget.play();
                    this._tracksWidget.play();
                } else {
                    this._playerWidget.pause();
                    this._tracksWidget.pause();
                }
            }
        }).click(function () {
            $(this).focus();
        });

        this._container.find(".save-btn.header-icon").click(() => {
            if (this._options.onSave)
                this._options.onSave(this.getData());
        });
        this._container.find(".cancel-btn.header-icon").click(() => {
            if (this._options.onCancel)
                this._options.onCancel();
        });
    }

    refreshItem() {
        this._data = this._playerWidget.getData();
        super.refreshItem();
        this._renderAssets();
        this._renderTracks();
        this._renderPlayer();
    }

    _renderPlayer() {
        let tracks = this._options.tracks.data;
        let that = this;
        this._readDataProperty(tracks).then(function (tracks) {
            that._playerWidget.render(tracks);
        }).catch(function (err) {
            console.error(err);
        });
    }

    _renderTracks() {
        let tracks = this._options.tracks.data;
        let that = this;
        this._readDataProperty(tracks).then(function (tracks) {
            that._tracksWidget.render(tracks);
        }).catch(function (err) {
            console.error(err);
        });
    }

    //_findAudio(tracks) {
    //    if (!tracks) return null;
    //    for (let i = 0; i < tracks.length; i++) {
    //        if (tracks[i].type == "MP3") return tracks[i];
    //    }
    //    return null;
    //}

    _loadAudio(audio) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!audio || !audio.content) reject();
            else {
                if (that._options.tracks.onGetAudio) {
                    that._readDataProperty(
                        that._options.tracks.onGetAudio, audio.content
                    ).then(function (data) {
                        resolve({id: audio.id, data: data});
                    }).catch(function (err) {
                        console.error(err);
                        reject(err);
                    });
                }
            }
        });
    }

    _renderAssets() {
        let assets = this._options.assets.data;
        let that = this;

        this._readDataProperty(assets).then(function (assets) {
            that._assetsWidget.render(assets);
            //let audioObj = that._findAudio(assets);
            //if (audioObj) {
            //    that._loadAudio(audioObj).then(function (audio) {
            //        that._playerWidget.setAudio(audio);
            //    });
            //}

        }).catch(function (err) {
            console.error(err);
            that._assetsWidget.render(null);
        });
    }

    _readDataProperty(option, e) {
        return new Promise((resolve, reject) => {
            if (option) {
                if ($.isFunction(option)) {
                    option = option(e);
                }
                if (option && $.isFunction(option.then)) {
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

    _getAssets () {
        if (this._data && this._data.assets) return this._data.assets;
        else return [];
    }

    _getTracks() {
        if (this._data &&
            this._data.episodes && this._data.episodes.length > 0 &&
            this._data.episodes[0].tracks)
            return this._data.episodes[0].tracks;
        else
            return [];
    }

    _getAssetsOptions() {
        let that = this;
        return {
            onAdd: function (e) {
                if (that._options.assets.onAddAsset)
                    return that._options.assets.onAddAsset(e);
            },
            onDelete: function (e) {
                if (that._options.assets.onDeleteAsset)
                    that._options.assets.onDeleteAsset(e);
            },
            mainContainer: this._container.find(".work-shop")
        }
    }

    _getTracksOptions() {
        let that = this;
        return {
            onAdd: function () {
                let newTrack = that._addTrack();
                that._playerWidget.addTrack(newTrack);
                that._data = that._playerWidget.getData();
                that.render();
            },
            onDelete: function (e) {
                that._playerWidget.deleteTrack(e.id);
                that._data = that._playerWidget.getData();
                that.render();
                if (that._options.tracks.onDeleteTrack)
                    that._options.tracks.onDeleteTrack(e);
            },
            onAddElement: function (e) {
                that._playerWidget.addElement(e.track, e.elements);
                that._data = that._playerWidget.getData();
                if (that._options.tracks.onAddElement)
                    that._options.tracks.onAddElement(e);
                that.render();
            },
            onEditElement: function (e) {
                that._playerWidget.editElement(e.track, e.elements);
                that._data = that._playerWidget.getData();
                for (let i = 0; i < e.elements.length; i++) {
                    let el = e.elements[i];
                    if (el.focused) {
                        that._renderPropEditor(el.id);
                        break;
                    }
                }
                that.render();
            },
            onMoveElement: function (e) {
                that._playerWidget.moveElements(e);
                if (that._options.tracks.onMoveElement)
                    that._options.tracks.onMoveElement(e);
                that._data = that._playerWidget.getData();
                that.render();
            },
            onDeleteElement: function(e) {
                that._playerWidget.deleteElement(e);
                that._data = that._playerWidget.getData();
                if (that._options.tracks.onDeleteElement)
                    that._options.tracks.onDeleteElement(e);
                that.render();
            },
            onGetAudioState: function () {
                return that._playerWidget.getAudioState();
            },
            onPlay: function () {
                that._playerWidget.play();
            },
            onPause: function () {
                that._playerWidget.pause();
            },
            onSetPosition: function (position) {
                that._playerWidget.setPosition(position);
            },
            onSetPositionEnd: function (position) {
                that._playerWidget.renderPosition(position);
            },
            onGetMute: function() {
                return that._playerWidget.getMute();
            },
            onToggleMute: function() {
                that._playerWidget.toggleMute();
            },
            onSetVolume: function(volume) {
                that._playerWidget.setVolume(volume);
            },
            onSetRate: function(rate) {
                that._playerWidget.setRate(rate);
            },
            onAddAsset: function (e) {
                if (that._options.tracks.onAddAsset)
                    return that._options.tracks.onAddAsset(e);
            },
            onGetAsset: function(assetId) {
                let assets = that._getAssets();
                for (let i = 0; i < assets.length; i++) {
                    if (assets[i].id == assetId) {
                        return assets[i];
                    }
                }

                return null;
            },
            mainContainer: this._container.find(".work-shop")
        }
    }

    _getPlayerOptions() {
        let that = this;
        return {
            designMode: true,
            loader: new Loader(),
            onCurrentTimeChanged: function (e) {
                that._tracksWidget.renderAudioState(e);
            },
            onAudioLoaded: function (e) {
                that._tracksWidget.initAudio(e);
            },
            onSetPosition: function (e) {
                let elId = e.trackElId;
                that._tracksWidget.setElementPosition(elId, e.position);
                let data = that._tracksWidget.getElementData(elId);
                if (data.focused) {
                    that._renderPropEditor(elId);
                }
                //that._propeditorWidget.render(data);
                if (that._options.player.onSetElementPosition)
                    that._options.player.onSetElementPosition(e);
            },
            onFocused: function (e) {
                let elId = e.trackElId;
                let oldFocused = that._tracksWidget.setFocused(elId);

                if (that._options.player.onElementFocused) {
                    that._options.player.onElementFocused({
                        trackElId: e.trackElId,
                        oldFocusedId: oldFocused ? oldFocused.id : null
                    });
                }
                that._renderPropEditor(elId);
            },
            onSetTextData: function (e) {
                let elId = e.trackElId;
                that._tracksWidget.setTextElementData(elId, e.data);
                let data = that._tracksWidget.getElementData(elId);

                if (data.focused) {
                    that._renderPropEditor(elId);
                }
                that._data = that._playerWidget.getData();

                //that._propeditorWidget.render(data);
                //if (that._options.player.onSetTextData) {
                //    that._options.player.onSetTextData({
                //        trackElId: e.trackElId,
                //        data: e.data
                //    })
                //}
            },
            onAddElement: function (e) {
                that._tracksWidget.addElement(e.track, e.elements);
                if (that._options.tracks.onAddElement)
                    that._options.tracks.onAddElement(e);
                that._tracksWidget.render();
            },
            onChangeTitles: function (e) {
                that._renderTitles(e);
            }
        };
    }

    _renderTitles(titles) {
        let _title = '',
            _subTitle = '';

        titles.forEach((item) => {
            if (item.title) {
                if (_title !== "") _title += "\n";
                _title += item.title ? item.title : '';

                if (_subTitle !== "") _subTitle += "\n";
                _subTitle += item.title2 ? item.title2 : '';
            }
        });

        this._titles.find(".ws-player-title").text(_title);
        this._titles.find(".ws-player-subtitle").text(_subTitle);

        if (_title !== "" || _subTitle !== "") this._titles.show();
        else this._titles.hide();
    }

    _renderPropEditor(elId) {
        let data = this._tracksWidget.getElementData(elId);

        if (this._propeditorWidget) {
            this._propeditorWidget.destroy();
        }

        if (CWSPlayer._getElementType(data) == "text") {
            // if () {
            //
            this._propeditorWidget = new CWSPropEditorText(
                this._propsContainer,
                this._getPropEditorOptions()
            );
            //
        } else {//if (data.data.type === 'image') {

            this._propeditorWidget = new CWSPropEditorImage(
                this._propsContainer,
                this._getPropEditorOptions()
            );

        }

        this._propeditorWidget.render(data);

    }

    _getPropEditorOptions() {
        let that = this;
        return {
            data: null,
            onPropertyChanged: function (e) {
                that._tracksWidget.setElementData(e.data);
            }
        };
    }

    _addTrack() {
        let tracks = this._getTracks();
        let maxId = 0;
        for (let i = 0; i < tracks.length; i ++) {
            if (tracks[i].id > maxId) maxId = tracks[i].id;
        }

        maxId++;

        let newTrack = {
            id: maxId,
            elements: []
        }

        tracks.push(newTrack);
        return newTrack;
    }

    getData() {
        let data = this._playerWidget.getData();
        if (data.episodes[0]) {
            let ep = data.episodes[0];
            if (ep.tracks) delete ep.tracks;
            if (ep.tracksIdx) delete ep.tracksIdx;
        }
        return data;
    }

    destroy() {
        this._assetsWidget.destroy();
        this._tracksWidget.destroy();
        this._playerWidget.destroy();
        this._container.empty()
    }

    _correctData(data) {
        for (let i = 0; i < data.episodes.length; i++) {
            let ep = data.episodes[i];
            for (let j = 0; j < ep.elements.length; j++) {
                let el = ep.elements[j];
                if (el.effects === undefined) {
                    el.effects = [];
                }

                if (el.effects.length === 0) {
                    el.effects.push({
                        "type": "zoom",
                        "start": 0,
                        "duration": 0,
                        "acceleration": 0
                    });
                }
            }
        }
    }
}
//    }
//);
