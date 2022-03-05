/**
 * Created by levan.kiknadze on 19/05/2017.
 */

import CWorkShop from "work-shop/work-shop2";
import 'jquery-ui/jquery-ui.js';
import 'script-lib/binary-transport.js';
import 'script-lib/mouseheld.js'

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

var Utils = {};

Utils.guid = function () {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

window.Utils = Utils;

(function($){
    $(document).ready(function () {

        //require(["work-shop/work-shop"], function (WS) {
            var options = initOptions();
            var ws = new CWorkShop($(".ws-container"), options);
            ws.render();

            function onGetData() {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: "/genData2",
                        type: "GET",
                        dataType: "json",
                        responseType: 'json',
                        success: function (result) {
                            resolve(result)
                        },
                        fail: function (err) {
                            reject(err);
                        }
                    });
                });
            }

            function initOptions() {
                var result = {
                    data: onGetData,
                    onSave: onSave,
                    onCancel: onCancel,
                    assets: {
                        onAddAsset: onAddAsset,
                        onDeleteAsset: onDeleteAsset
                    },
                    tracks: {
                        onDeleteTrack: onDeleteTrack,
                        onGetAudio: onGetAudio,
                        onAddElement: onAddElement,
                        onMoveElement: onMoveElement,
                        onDeleteElement: null,
                        onAddAsset: onAddAssetFromTrack
                    },
                    player: {
                        onSetElementPosition: setPlayerElementPosition,
                        onElementFocused: setPlayerElementFocused
                    }
                };

                return result;
            }

            function onGetAudio(url) {
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

            function onAddAsset(e) {
                var newId = Utils.guid();
                $.post('/svc/uploadAsset', {
                    fileName: e.filename,
                    body: e.body
                }).done(function (resp) {
                    assetsList.push({
                        "id": newId,
                        "title": "Новое изображение_" + assetsList.length,
                        "type": "PNG",
                        "size": e.size,
                        "icon": resp.url,
                        "content": resp.url,
                        "contentBody": e.body
                    });
                    ws.render();
                });

                return newId;
            }

            function onDeleteAsset(e) { // не работает
                var id = e.id;
                for (var i = 0; i < assetsList.length; i++) {
                    var a = assetsList[i];
                    if (a.id == id) {
                        assetsList.splice(i, 1);
                        deleteAssetFromTracks(id);
                        break;
                    }
                }
                ws.render();
            }

            function deleteAssetFromTracks(id) {
                for (var i = 0; i < tracksList.length; i++) {
                    var track = tracksList[i];
                    for (var j = 0; j < track.elements.length; j++) {
                        var el = track.elements[j];
                        if (el.asset && el.asset.id == id) el.asset = null;
                    }
                }
            }

            function onDeleteTrack(e) {
            }

            function onAddElement(e) {
            }

            function onMoveElement(e) {
            }

            function setPlayerElementPosition(e) {
            }

            function setPlayerElementFocused(e) {
            }

            function onAddAssetFromTrack(e) {
                return new Promise((resolve, reject) => {
                    $.post('/svc/uploadAsset', {
                        fileName: e.filename,
                        body: e.body
                    }).done(function (resp) {
                        var newId = Utils.guid();
                        assetsList.push({
                            "id": newId,
                            "title": "Новое изображение_" + assetsList.length,
                            "type": "PNG",
                            "size": e.size,
                            "icon": resp.url,
                            "content": resp.url,
                            "contentBody": e.body
                        });
                        resolve(newId);
                    }).fail(function(err) {
                        reject(err);
                    });
                });
            }

            function onSave(data) {
                console.log(data);
            }

            function onCancel() {
                console.log("cancel callback called");
            }
    });
})(jQuery);
