/**
 * Created by levan.kiknadze on 19/05/2017.
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
};


(function($){
    $(document).ready(function () {
        require(["work-shop/work-shop"], function (WS) {
            var options = initOptions();
            var ws = new WS($(".ws-container"), options);

            $.ajax({
                url: "/genData2",
                type: "GET",
                dataType: "json",
                responseType: 'json',
                success: function (result) {
                    ws.render();
                },
                fail: function (err) {
                    console.error(err);
                }
            });

            function initOptions() {
                var result = {
                    assets: {
                        data: getAssetsList,
                        onAddAsset: onAddAsset,
                        onDeleteAsset: onDeleteAsset
                    },
                    tracks: {
                        data: getTracksList,
                        onAddTrack: onAddTrack,
                        onDeleteTrack: onDeleteTrack,
                        onGetAudio: onGetAudio,
                        onAddElement: onAddElement,
                        onEditElement: onEditElement,
                        onMoveElement: onMoveElement,
                        onAddAsset: onAddAssetFromTrack
                    },
                    player: {
                        onGetAssets: getAssets,
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

            function getAssetsList() {
                return new Promise((resolve, fail) => {
                    setTimeout(function () {
                        resolve(assetsList);
                    }, 0);
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

            function onDeleteAsset(e) {
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

            function getTracksList() {
                return new Promise((resolve, fail) => {
                    setTimeout(function () {
                        resolve(tracksList);
                    }, 0);
                });
            }

            function onAddTrack() {
                setTimeout(function () {
                    var track = {
                        "id": Utils.guid(),
                        elements: []
                    }
                    tracksList.push(track);
                    ws.render();
                }, 0);
            }

            function onDeleteTrack(e) {
                setTimeout(function () {
                    var id = e.id;
                    for (var i = 0; i < tracksList.length; i++) {
                        if (tracksList[i].id == id) break;
                    }
                    tracksList.splice(i, 1);

                    ws.render();
                }, 0);
            }

            function onAddElement(e) {
                var trackId = e.track;
                var elemsData = e.elements;
                var track = findTrack(trackId);

                if (!track) return;
                track.elements = elemsData;
                ws.render();
            }

            function onEditElement(e) {
                var trackId = e.track;
                var track = findTrack(trackId);

                if (!track) return;

                track.elements = e.elements;
                ws.render();
            }

            function onMoveElement(e) {
                var trackId = e.track;
                var oldTrackId = e.oldTrackId;
                var elemsData = e.elements;
                var oldElementsData = e.oldTrackElements;
                var track = findTrack(trackId);
                var oldTrack = findTrack(oldTrackId);

                if (!(track && oldTrack)) return;
                track.elements = elemsData;
                oldTrack.elements = oldElementsData;

                ws.render();
            }

            function findTrack(id) {
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

            function findElement(id) {
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

            function setPlayerElementPosition(e) {
                var elId = e.trackElId;
                var el = findElement(elId);
                el.position = e.position;
            }

            function setPlayerElementFocused(e) {
                var elId = e.trackElId;
                var el = findElement(elId);
                el.focused = true;
                if (e.oldFocusedId) {
                    var old = findElement(e.oldFocusedId);
                    old.focused = false;
                }
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
        });
    });
})(jQuery);
