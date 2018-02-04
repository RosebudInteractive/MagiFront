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
}


$(document).ready(function () {
    require(["work-shop/work-shop"], function (WS) {
        var assetsList = [
            {
                "id": "39401a24-e294-66dc-889d-e291e30acc62",
                "title": "Queen1.jpg",
                "type": "PNG",
                "size": {width: 500, height: 500},
                "icon": "/images/queen1.jpg",
                "content": "/images/queen1.jpg"
            },
            {
                "id": "a24c7c5b-6db2-c68c-457d-76ec0498a8b2",
                "title": "Брахман.png",
                "type": "PNG",
                "size": {width: 625, height: 417},
                "icon": "/images/queen2.jpg",
                "content": "/images/queen2.jpg"
            },
            {
                "id": "5b56e7a0-9d46-e1b7-0054-f28097aa87b3",
                "title": "Давид Агмашенебели. Царь-таджик на нексия вжик-вжик",
                "type": "PNG",
                "size": {width: 400, height: 264},
                "icon": "/images/queen3.jpg",
                "content": "/images/queen3.jpg"
            },
            {
                "id": "2e50d9d6-6b9c-2260-392f-6adbf5c28948",
                "title": "Innuendo",
                "type": "MP3",
                "duration": 391,
                "content": "/images/queen-innuendo.mp3"
            }
        ];

        var tracksList = [{
            "id": "6d0cf56f-60c2-e10e-bc30-725c539c5140",
            "elements": [{
                "id": "b8055b3a-ab95-18e7-c203-42891406341b",
                "asset": {id: "39401a24-e294-66dc-889d-e291e30acc62", body: null},
                "start": 5,
                "duration": 12,
                "width": 0,
                "height": 0,
                "position": {
                    "left": 0,
                    "top": 0,
                    "bottom": 11,
                    "right": 50
                },
                "effects": [
                    {
                        "type": "zoom",
                        "start": 19.6,
                        "duration": 6.6,
                        "acceleration": 46
                    }
                ]
            }]
        }, {
            "id": "2a5a8f81-1a57-481b-01d5-5cd0d2922ee3",
            "elements": [{
                "id": "59d8cea5-2e29-1d73-bf21-9906366b56f8",
                "asset": {id: "a24c7c5b-6db2-c68c-457d-76ec0498a8b2", body: null},
                "start": 11.354166666666668,
                "duration": 10,
                "focused": true,
                "position": {
                    "left": 30,
                    "top": 17,
                    "bottom": 20,
                    "right": 20
                },
                "effects": [
                    {
                        "type": "zoom",
                        "start": 19.6,
                        "duration": 6.6,
                        "acceleration": 46
                    }
                ]
            }]
        }];

        var options = initOptions();
        var ws = new WS($(".ws-container"), options);

        new Promise((resolve, reject) => {
            $.ajax({
                url: "/genData",
                type: "GET",
                dataType: "json",
                responseType: 'json',
                success: function (result) {
                    tracksList = result.tracks;
                    assetsList = result.assets;
                    resolve();
                },
                fail: function () {
                    reject();
                }
            });
        }).then(() => {
            ws.render();
        }).catch((err) => {
            console.error(err);
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

            return newId;
        }
    });
});
