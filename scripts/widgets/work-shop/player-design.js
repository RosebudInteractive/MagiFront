import CWSPlayerElementImageDesign from "./player-element-image-design"
import CWSPlayerElementTextDesign from "./player-element-text-design"
import CWSPlayer from "work-shop/player";

//define(
//    ["./player", './player-element-design'],
//    function (CWSPlayer, CWSPlayerElementDesign) {
function compareElements(a,b) {
    if (a.start < b.start)
        return -1;
    if (a.start > b.start)
        return 1;
    return 0;
}

export default class CWSPlayerDesign extends CWSPlayer {
    constructor(container, options) {
        super(container, options);

        this._setTextToolsEvents();
    }

    _getElementConstructor(data) {
        let type = CWSPlayer._getElementType(data);
        switch (type) {
            case "text": return CWSPlayerElementTextDesign;
            case "image": return CWSPlayerElementImageDesign;
        }
    }

    _setEvents() {
        super._setEvents();
        let item = this._container.children();

        const cont = item.children(".ws-player-content");
        cont.droppable({
            tolerance: "touch",
            accept: (el) => {
                let accept = el.hasClass("ws-assets-item");
                accept = accept && this._findFreeSpace();
                return accept;
            },
            drop: ( event, ui ) => {
                let freeTrackId = this._findFreeSpace();
                if (ui.draggable.hasClass("ws-assets-item") && freeTrackId)
                    this._onDropAsset(freeTrackId, ui);
            }
        });
    }

    _onDropAsset(trackId, ui) {
        let hOffset = ui.helper.offset();
        let track = this._findTrack(trackId);

        let startTime = this._audioState.currentTime;
        let assData = ui.draggable.data("data");
        // player ratio is 16:9
        // if player width = 160, then 30% is
        let w = 30;
        let actualWidth = 160 * (w / 100);
        let pictRatio = assData.info.size.height / assData.info.size.width;
        let actualHeight = actualWidth * pictRatio;
        // calculate actualHeight's %
        let h = actualHeight / 90 * 100;

        let cont = this._container.find(".ws-player-content");
        let contOffset = cont.offset();
        let cw = cont.width();
        let ch = cont.height();
        let l = (hOffset.left - contOffset.left) / cw * 100,
            t = (hOffset.top - contOffset.top) / ch * 100,
            r = 100 - l - w,
            b = 100 - t - h;
        if (b < 0) {
            t += b;
            b = 0;
        }
        if (r < 0) {
            l += r;
            r = 0;
        }


        let element = {
            id: Utils.guid(),
            asset: ui.draggable.data("data"),
            assetId: ui.draggable.data("data").id,
            start: startTime,
            content: {
                duration: 5,
                track: trackId,
            },
            position: {
                left: l,
                top: t,
                right: r,
                bottom: b
            },
            effects:[
                {"type": "zoom", "start": 0, "duration": 0, "acceleration": 0}
            ],
        };
        track.elements.push(element);

        this._options.loader.changeElements(trackId, track.elements);
        this._prepareElements();
        this.renderPosition(null);

        if (this._correctElementsIntersection(track, element, false))
            this._broadcastAddElement(trackId, track.elements);
    }

    _findFreeSpace() {
        let pos = this._audioState.currentTime;
        let trackId = null;
        let tracksList = this._getTracksList();

        for (let i = 0; i < tracksList.length; i++) {
            let track = tracksList[i];
            let trackIsFree = true;
            for (let j = 0; j < track.elements.length; j++) {
                let el = track.elements[j];
                if (el.start <= pos && pos <= el.start + el.content.duration) {
                    trackIsFree = false;
                    break;
                }
            }
            if (trackIsFree) {
                trackId = track.id;
                break;
            }
        }

        return trackId;
    }

    _findTrack(id) {
        let tracks = this._getTracksList();
        let track = null;
        for (let i = 0; i < tracks.length; i++) {
            let cur = tracks[i];
            if (cur.id == id) {
                track = cur;
                break;
            }
        }

        return track;
    }

    _correctElementsIntersection(track, editedData, shift) {
        let audioState = this._audioState;

        let elements = [];
        for (let i = 0; i < track.elements.length; i++) {
            if (track.elements[i].id == editedData.id)
                elements.push(editedData);
            else
                elements.push($.extend(true, {}, track.elements[i]));
        }

        elements = elements.sort(compareElements);

        let currentPos = 0;
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let oldStart = element.start;

            if (currentPos > element.start) {
                element.start = currentPos;
            }
            // если не зажат Shift, то пытаемся ужать следующий элемент
            if (!shift && oldStart != element.start) {
                element.content.duration -= element.start - oldStart;
                if (element.content.duration < 1) element.content.duration = 1;
            }

            currentPos = element.start + element.content.duration;
        }
        let last = elements[elements.length - 1];
        if (last.start + last.content.duration > audioState.duration) {
            return false;
        }

        for (let i = 0; i < elements.length; i++) {
            let el = elements[i];
            for (let j = 0; j < track.elements.length; j++) {
                if (track.elements[j].id == el.id) {
                    let tEl = track.elements[j];
                    tEl.start = el.start;
                    tEl.content.duration = el.content.duration;
                    break;
                }
            }
        }
        track.elements = track.elements.sort(compareElements);
        return true;
    }

    _broadcastAddElement(trackId, elements) {
        if (this._options.onAddElement) {
            this._options.onAddElement({track: trackId, elements: elements});
        }
    }

    _setSize(sizeIdx, target) {
        let textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
        textDiv._textTools.setCurrentSize(sizeIdx);
        textDiv._textTools.grabContent();
        textDiv._textTools.update();
        $('.ws-text-element-tools-a').each((index, item) => {$(item).removeClass('ws-text-element-tools-a-selected');});
        $(target).addClass('ws-text-element-tools-a-selected');
        this._setRatio(this._player);
    }

    _setTextToolsEvents() {
        $('.ws-text-element-tools-a1').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._setSize(0, e.target);
        });

        $('.ws-text-element-tools-a2').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._setSize(1, e.target);
        });

        $('.ws-text-element-tools-a3').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._setSize(2, e.target);
        });

        $('.ws-text-element-tools-i').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            $('#' + window.textId).focus();
            document.execCommand('Italic', false, null);
            let textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
            textDiv._textTools.grabContent();
        });

        $('.ws-text-element-tools-b').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            $('#' + window.textId).focus();
            document.execCommand('Bold', false, null);
            let textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
            textDiv._textTools.grabContent();
        });

        $('.ws-text-element-tools-ol').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            $('#' + window.textId).focus();
            document.execCommand('insertUnorderedList', false, null);
            let textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
            textDiv._textTools.grabContent();
        });

        let clEl = $('.ws-text-element-tools-color');
        if (clEl.length > 0) {
            clEl[0].controls = {
                setColor: (color) => {
                    let clEl = $('.ws-text-element-tools-color');
                    clEl[0].style.backgroundColor = color;
                    clEl[0].style.borderColor = color;
                },
            }
        }
        $('.ws-text-element-tools-color').on('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            $('#' + window.textId).focus();
            // console.log(getComputedStyle($('.ws-text-element-tools-color')[0]).backgroundColor);

            document.execCommand('hiliteColor', false, getComputedStyle($('.ws-text-element-tools-color')[0]).backgroundColor);
            let textDiv = document.getElementById(window.textId);// $('#' + window.textId)[0];
            textDiv._textTools.grabContent();
        });
        $('.ws-text-element-tools-color').on('mouseheld', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            // console.log('color held')
            // console.log($('.ws-text-element-tools-color')[0].controls.setColor('#F00'));
            $('.ws-text-element-tools-color-pal').css({'display': 'block'});
        });
        $('.ws-text-element-tools-color-pal').on('mouseleave', () => {
            $('.ws-text-element-tools-color-pal').css({'display': 'none'});
        });
        $('.ws-text-element-tools-color-item').each((index, value) => {
            $(value).on('click', () => {
                let clEl = $('.ws-text-element-tools-color');
                clEl[0].controls.setColor( getComputedStyle($(value)[0]).backgroundColor );
                $('.ws-text-element-tools-color-item').each((index, item) => {
                    $(item).removeClass('ws-text-element-tools-color-selected');
                });
                $(value).addClass('ws-text-element-tools-color-selected');
            });
        });
    }

    _getEpisode() {
        let data = this._options.loader.getData();
        if (!data || !data.episodes || data.episodes.length == 0)
            return [];
        // монтажный стол работает только с одним эпизодом
        return data.episodes[0];
    }

    _getTracksList() {
        let ep = this._getEpisode();
        return ep.tracks || [];
    }

    _getElementOptions(elData) {
        let that = this;
        return {
            data: elData,
            designMode: this._options.designMode,
            loader: this._options.loader,
            onSetPosition: function (e) {
                if (that._options.onSetPosition) that._options.onSetPosition(e);
                that._setDesignElementPosition(e);
            },
            onFocused: function (e) {
                for (let i = 0; i < that._elements.array.length; i++) {
                    let el = that._elements.array[i];
                    if (el.Id != elData.id) el.Focused = false;
                }
                that.renderPosition(null);
                if (that._options.onFocused) that._options.onFocused(e);
            },
            onSetTextData: function (e) {
                let elId = e.trackElId;
                //let data = that._tracksWidget.getElementData(elId);

                let tracks = that._getTracksList();
                let element = null;
                let track = null;
                for (let i = 0; i < tracks.length; i++) {
                    let tr = tracks[i];
                    for (let j = 0; j < tr.elements.length; j++) {
                        if (tr.elements[j].id == elId) {
                            track = tr;
                            element = tr.elements[j];
                            break;
                        }
                    }

                    if (track) {
                        break;
                    }
                }

                if (element) {
                    element.data = e.data;
                    that._options.loader.changeElements(track.id, track.elements);
                    that._prepareElements();

                }

                if (that._options.onSetTextData) that._options.onSetTextData(e);
            }
        }
    }

    _setDesignElementPosition(e) {
        this._options.loader.setElementPosition(e)
        this._prepareElements();
    }

    addElement(trackId, elements) {
        this._options.loader.changeElements(trackId, elements);
        this._prepareElements();
        this.renderPosition(null);
    }

    editElement(trackId, elements) {
        this._options.loader.changeElements(trackId, elements);
        this._prepareElements();
        this.renderPosition(null);
    }

    moveElements(e) {
        let trackId = e.track;
        let oldTrackId = e.oldTrackId;
        let elemsData = e.elements;
        let oldElementsData = e.oldTrackElements;

        this._options.loader.changeElements(trackId, elemsData);
        if (trackId != oldTrackId) {
            this._options.loader.changeElements(oldTrackId, oldElementsData);
        }
        this._prepareElements();
        this.renderPosition(null);
    }

    deleteElement(elId) {
        this._options.loader.deleteElement(elId);
        this._prepareElements();
        this.renderPosition(null);
    }

    addTrack(track) {
        this._options.loader.addTrack(track);
        this.renderPosition(null);
    }

    deleteTrack(track) {
        this._options.loader.deleteTrack(track);
        this._prepareElements();
        this.renderPosition(null);
    }

    getData() {
        return $.extend(true, {}, this._options.loader.getData())
    }

    destroy() {
        let item = this._container.children();
        let cont = item.children(".ws-player-content");
        cont.droppable("destroy");
        this._unSetTextToolsEvents();

        super.destroy();

        this._container.empty();
    }


    _unSetTextToolsEvents() {
        $('.ws-text-element-tools-a1').off('click');
        $('.ws-text-element-tools-a2').off('click');
        $('.ws-text-element-tools-a3').off('click');
        $('.ws-text-element-tools-i').off('click');
        $('.ws-text-element-tools-b').off('click');
        $('.ws-text-element-tools-ol').off('click');
        $('.ws-text-element-tools-color').off('click');
        $('.ws-text-element-tools-color').off('mouseheld');
        $('.ws-text-element-tools-color-pal').off('mouseleave');
        $('.ws-text-element-tools-color-item').each((index, value) => {
            $(value).off('click');
        });
    }
}
//    }
//);