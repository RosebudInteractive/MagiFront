import * as workShopActions from '../actions/work-shop-actions';
import {store} from '../store/configureStore';

import CWorkShop from "work-shop/work-shop2";
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'
import 'script-lib/iscroll.js'
import $ from 'jquery'


var Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.Utils = Utils;

var _instance = null
let _data = null;

class AdmWorkShop {
    static loadData(data) {
        _instance = new AdmWorkShop(data);
        store.dispatch(workShopActions.show())
    }

    static close() {
        _instance = null
    }

    constructor(data) {
        let _options = this._initOptions();
        _data = Object.assign({}, data);
        let div = $('.ws-container');
        this._ws = new CWorkShop(div, _options);
        this._ws.render();
    }

    _initOptions() {
        let that = this;

        let result = {
            data: that._onGetData,
            assets: {
                // onAddAsset: onAddAsset,
                // onDeleteAsset: onDeleteAsset
            },
            tracks: {
                onDeleteTrack: this._onDeleteTrack,
                onGetAudio: this._onGetAudio,
                onAddElement: this._onAddElement,
                onMoveElement: this._onMoveElement,
                onAddAsset: this._onAddAssetFromTrack
            },
            player: {
                onSetElementPosition: this._setPlayerElementPosition,
                onElementFocused: this._setPlayerElementFocused
            }
        };

        return result;
    }

    _onGetData() {
        return Promise.resolve(_data)
    }


    _onGetAudio(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: "GET",
                dataType: "binary",
                processData: false,
                responseType: 'arraybuffer',
                success: function (result) {
                    resolve(result);
                },
                fail: function () {
                    reject();
                }
            });
        });
    }

    _onDeleteTrack(e) {
        console.log('_onDeleteTrack', e)
        // setTimeout(function () {
        //     var id = e.id;
        //     for (var i = 0; i < tracksList.length; i++) {
        //         if (tracksList[i].id == id) break;
        //     }
        //     tracksList.splice(i, 1);
        //
        //     ws.render();
        // }, 0);
    }

    _onAddElement(e) {
        console.log('_onAddElement', e)
    }

    _onMoveElement(e) {
        console.log('_onMoveElement', e)
    }

    _findTrack(id) {
        var track = null;
        for (var i = 0; i < tracksList.length; i++) {
            var cur = tracksList[i];
            if (cur.id == id) {
                track = cur;
                break;
            }
        }

        return track;
    }

    _findElement(id) {
        var element = null;
        for (var i = 0; i < tracksList.length; i++) {
            var cur = tracksList[i];
            for (var j = 0; j < cur.elements.length; j++) {
                if (cur.elements[j].id == id) {
                    element = cur.elements[j];
                    break;
                }
            }
        }

        return element;
    }

    _getAssets(ids) {
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

    _setPlayerElementPosition(e) {
        console.log('_setPlayerElementPosition', e)
        // var elId = e.trackElId;
        // var el = findElement(elId);
        // el.position = e.position;
    }

    _setPlayerElementFocused(e) {
        console.log('_setPlayerElementFocused', e)
        // var elId = e.trackElId;
        // var el = findElement(elId);
        // el.focused = true;
        // if (e.oldFocusedId) {
        //     var old = findElement(e.oldFocusedId);
        //     old.focused = false;
        // }
    }

    _onAddAssetFromTrack(e) {
        console.log('_onMoveElement', e)
        // return new Promise((resolve, reject) => {
        //     $.post('/svc/uploadAsset', {
        //         fileName: e.filename,
        //         body: e.body
        //     }).done(function (resp) {
        //         var newId = Utils.guid();
        //         assetsList.push({
        //             "id": newId,
        //             "title": "Новое изображение_" + assetsList.length,
        //             "type": "PNG",
        //             "size": e.size,
        //             "icon": resp.url,
        //             "content": resp.url,
        //             "contentBody": e.body
        //         });
        //         resolve(newId);
        //     }).fail(function (err) {
        //         reject(err);
        //     });
        // });
    }
}

export default AdmWorkShop;
