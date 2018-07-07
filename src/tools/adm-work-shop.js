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

/* eslint-disable */
var _instance = null
/* eslint-enable */
let _data = null;

class AdmWorkShop {
    static loadData(data) {
        _instance = new AdmWorkShop(data);
        store.dispatch(workShopActions.show(data.callingRoute))
    }

    static close() {
        _instance.destroy();
        _instance = null
    }

    constructor(data) {
        let _options = this._initOptions();
        _data = Object.assign({}, data);
        let div = $('.ws-container');
        this._ws = new CWorkShop(div, _options);
        this._ws.render();
    }

    destroy() {
        this._ws.destroy();
    }

    _initOptions() {
        let that = this;

        let result = {
            data: that._onGetData,
            assets: {},
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
            },
            onSave: this._onSave,
            onCancel: this._onCancel,
        };

        return result;
    }

    _onCancel() {
        _data = null
        store.dispatch(workShopActions.hide())
    }

    _onSave(data) {
        store.dispatch(workShopActions.save(data))
        store.dispatch(workShopActions.hide())
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
    }

    _onAddElement(e) {
        console.log('_onAddElement', e)
    }

    _onMoveElement(e) {
        console.log('_onMoveElement', e)
    }

    _setPlayerElementPosition(e) {
        console.log('_setPlayerElementPosition', e)
    }

    _setPlayerElementFocused(e) {
        console.log('_setPlayerElementFocused', e)
    }

    _onAddAssetFromTrack(e) {
        console.log('_onMoveElement', e)
    }
}

export default AdmWorkShop;
