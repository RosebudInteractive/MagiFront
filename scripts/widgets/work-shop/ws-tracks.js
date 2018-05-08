/**
 * Created by levan.kiknadze on 30/05/2017.
 */
import CWSBase from "./ws-base";
import tpl from 'text!./templates/work-shop.html';
import CWSTrackTools from "./ws-track-tools"

//define(
//    [
//        "./ws-base",
//        'text!./templates/work-shop.html',
//        "./ws-track-tools"
//    ],
//    function (CWSBase, tpl, CWSTrackTools) {
let steps = [1, 2, 5, 10, 20, 30, 60, 120, 180, 240, 360];
const STEP_WIDTH_MAX = 64;
const STEP_WIDTH_MIN = 42;
const STEP_TYPE_MIN = "minStepWidth";
const STEP_TYPE_MAX = "maxStepWidth";
const PTR_SCROLL_LEFT = "on_left";
const PTR_SCROLL_RIGHT = "on_right";
const PTR_SCROLL_NONE = "none";
// view will be scrolled if pointer is closer then
const PTR_SCROLL_BOUND = 150;

function compareElements(a,b) {
    if (a.start < b.start)
        return -1;
    if (a.start > b.start)
        return 1;
    return 0;
}

export default class CWSTracks extends CWSBase {
    constructor(container, options){
        super(container, tpl);
        this._scrollerDiv = container.find(".ws-tracks-list-scroll");
        this._list = this._scrollerDiv.children("div.list");
        this._createScroll();
        this._closeButtonsList = container.find(".ws-tools-right").find(".list");
        this._linerList = container.find(".ws-liner-list");
        this._setToolsEvents();
        this._options = options;
        this._circle = this._container.find(".zoom-circle");
        this._line = this._container.find(".zoom-line");
        this._lineWrapper = this._container.find('.zoom-line-wrapper');
        this._toolsPanel = new CWSTrackTools(
            this._container.find(".ws-tools-center"),
            this._getToolsPanelOptions()
        );
        this._setFileEvents();
        this._rate = {
            select: this._container.find('.ws-rate-select'),
            value: this._container.find('.ws-rate-select-value'),
            mousedownPosition: 0,
            eventMouseUp: () => {
                this._rate.select.removeClass('ws-rate-select-over');
                this._rate.select[0].removeEventListener('mousemove', this._rate.eventMouseMove);
                window.removeEventListener('mouseup', this._rate.eventMouseUp);
            },
            eventMouseMove: (e) => {
                this._rate._setRateMeter(e.offsetY);
            },
            run: (e) => {
                this._rate.select.addClass('ws-rate-select-over');
                this._rate.mousedownPosition = e.clientY;
                this._rate.select[0].addEventListener('mousemove', this._rate.eventMouseMove);
                window.addEventListener('mouseup', this._rate.eventMouseUp);
            },
            _setRateMeter: (value) => {

                let rateDiv = this._rate.select;
                let rateValueDiv = this._rate.value;

                let halfSize = rateDiv.height()/2;

                let middleOffset = 4;
                let rateValue = 0;

                if (value < halfSize-middleOffset) {
                    let newValue = rateDiv.height() - value;
                    if (newValue > rateDiv.height()) newValue = rateDiv.height();
                    let rateRatio = 2/rateDiv.height();
                    rateValue = newValue * rateRatio;
                    rateValueDiv.height(newValue);
                } else if (value >= halfSize-middleOffset && value <= halfSize+middleOffset) {
                    let newValue = rateDiv.height()/2;
                    let rateRatio = 1/rateDiv.height();
                    rateValue = newValue * rateRatio + 0.5;
                    rateValueDiv.height(newValue);
                } else {
                    let newValue = rateDiv.height() - value;
                    if (newValue > rateDiv.height()) newValue = rateDiv.height();
                    let rateRatio = 1/rateDiv.height();
                    rateValue = newValue * rateRatio + 0.5; //between
                    rateValueDiv.height(newValue);
                }
                let rateText = $('.ws-rate-select-text');
                rateText.text(rateValue.toFixed(2));
                this._setRateText(rateValue.toFixed(2));
                this._setRate(rateValue.toFixed(2));
            }
        }
    }

    _getToolsPanelOptions(){
        return {
            mainContainer: this._options.mainContainer
        }
    }

    render(tracks) {
        let that = this;
        let trackGuids = {};
        tracks = tracks || this._tracks || [];
        this._tracks = tracks;

        let template = CWSTracks.template("track");
        let closeTpl = CWSTracks.template("track-close");

        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            trackGuids[track.id] = true;
            let item = this._list.find("#t_" + track.id);
            if (item.length == 0) {
                item = $(template);
                item.attr("id", "t_" + track.id);
                this._list.prepend(item);
                let delBtn = $(closeTpl);
                delBtn.attr("id", "close_t_" + track.id).attr("data-track", track.id);
                this._closeButtonsList.prepend(delBtn);
                this._setDeleteBtnEvents(delBtn);
                this._setTrackEvents(item);
                this._setZoomEvents();
            }

            this._renderElements(track.elements, item);
        }

        this._list.children().each(function () {
            let id = $(this).attr("id").replace(/^t_/, '');
            if (!trackGuids[id]) {
                $(this).remove();
                that._closeButtonsList.find("#close_t_" + id).remove();
            }
        });

        // this._iscroll.refresh();
        try {this._scrollerDiv.scrollerData.scrollBy(0,0);} catch(err) {console.warning(err)}

        this._toolsPanel.render();
    }

    _setFileEvents() {
        // let that = this;
        this._fileInput = this._container.find("input[type='file']");

        this._fileInput.change( (evt) => {
            let files = evt.target.files; // FileList object

            // Loop through the FileList and render image files as thumbnails.
            for (let i = 0, f; f = files[i]; i++) {

                // Only process image files.
                // if (!f.type.match('image.*')) {
                //     continue;
                // }

                let reader = new FileReader();

                reader.addEventListener('load', (e) => {
                    let dataUrl = e.target.result;
                    let img = $("<img style='display: none'/>");
                    this._container.append(img);
                    img.load( () => {
                        let size = {
                            width: this.naturalWidth,
                            height: this.naturalHeight
                        };
                        this._newImageLoaded(f.name, dataUrl, size);
                    });
                    img.attr("src", dataUrl);
                })

                // Closure to capture the file information.
                // reader.onload = (function(theFile) {
                //     return function(e) {
                //         let dataUrl = e.target.result;
                //         let img = $("<img style='display: none'/>");
                //         that._container.append(img);
                //         img.load(function () {
                //             let size = {
                //                 width: this.naturalWidth,
                //                 height: this.naturalHeight
                //             };
                //             that._newImageLoaded(theFile.name, dataUrl, size);
                //         });
                //         img.attr("src", dataUrl);
                //     };
                // })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);

                // read only first file
                break;
            }

        });

    }

    _newImageLoaded(fileName, dataUrl, size) {
        if (!this._newElemData) return;
        let base64 = dataUrl.split(',')[1];
        this._broadcastAddAsset(fileName, base64, size, this._newElemData);
        this._newElemData = null;
    }

    _broadcastAddAsset(name, base64, size, elemData) {
        if (this._options && this._options.onAddAsset) {
            this._options.onAddAsset({
                filename: name,
                body: base64,
                size: size
            }).then((assetId) => {
                let track = this._findTrackByElement(elemData.id);
                let trItem = $("#t_" + track.id);
                elemData.asset = {
                    id: assetId
                };
                elemData.data = null;
                this._broadcastEditElement(trItem, track.elements);
            });
        }
    }


    getElementData(elId) {
        return $.extend(true, {}, this._findElement(elId));
    }

    setElementData(data) {
        let el = this._findElement(data.id);
        let that = this;
        let trItem = null;
        if (el) {
            for (let i = 0; i < this._tracks.length; i++) {
                let track = this._tracks[i];
                for (let j = 0; j < track.elements.length; j++) {
                    if (track.elements[j].id == data.id) {
                        track.elements[j] = data;
                        trItem = $("#t_" + track.id);
                        setTimeout(function () {
                            that._broadcastEditElement(trItem, track.elements);
                        });
                        break;
                    }
                }
            }

        }
    }

    assetsLoaded(assets) {
        for (let k = 0; k < assets.length; k ++) {
            for (let i = 0; i < this._tracks.length; i++) {
                let track = this._tracks[i];
                for (let j = 0; j < track.elements.length; j++) {
                    let el = track.elements[j];
                    if (el.asset.id == assets[k].id) {
                        el.asset.body = $.extend(true, {}, assets[k]);
                    }
                }
            }
        }

    }

    deleteFocused() {
        for (let i = 0; i < this._tracks.length; i++) {
            let track = this._tracks[i];
            for (let j = 0; j < track.elements.length; j++) {
                let el = track.elements[j];
                if (el.focused) {
                    let elId = el.id;
                    track.elements.splice(j, 1);
                    this._broadcastDeleteElement(elId);
                }
            }
        }

    }

    _setZoomCircle(e_offsetX) {
        let maxZoomPos = this._getMaxZoomPosition();
        let new_position = e_offsetX
        if (new_position < 0) new_position = 0;
        if (new_position > maxZoomPos) new_position = maxZoomPos;
        this._recalcZoomState(new_position);
        this._circle.css('left', new_position - this._circle.width()/2 + 'px');
        this._renderZoom(false);
        this._scrollerDiv.scrollerData.scrollBy(0,0);
        this.render();
    }

    _setZoomEvents() {
        let lineWrapperDown = false;
        this._lineWrapper.on('mouseenter', (e) => {
            this._lineWrapper.addClass('ws-zoom-over');
            lineWrapperDown = false;
        });

        this._lineWrapper.on('mouseleave', (e) => {
            this._lineWrapper.removeClass('ws-zoom-over');
            if (lineWrapperDown) this._setZoomCircle(e.offsetX)
            lineWrapperDown = false;
        });

        this._lineWrapper.on('mousedown', (e) => {
            lineWrapperDown = true;
            this._setZoomCircle(e.offsetX)
        });

        this._lineWrapper.on('mouseup', (e) => {
            if (lineWrapperDown) this._setZoomCircle(e.offsetX)
            lineWrapperDown = false;
        });

        this._lineWrapper.on('mousemove', (e) => {
            if (this._lineWrapper.hasClass('ws-zoom-over') && lineWrapperDown === true) {
                this._setZoomCircle(e.offsetX)
            }
        })

    }

    _renderElements(elements, item) {
        if (!this._zoomState) return;
        let cont = item.children(".ws-track-content");
        if (!elements) cont.empty();
        let p = this._getStepParams();
        let template = CWSTracks.template("track-element");

        let css = {};

        cont.children(".ws-track-element").each(function () {
            let oldElItem = $(this);
            let found = false;
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].id == oldElItem.attr("id").replace(/^te_/, '')) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                oldElItem.remove();
            }
        });

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let elItem = $("#te_" + element.id);

            if (elItem.length > 0 && elItem.data("parentId") != item.attr("id").replace(/^t_/, '')) {
                elItem.remove();
                elItem = {length: 0};
            }

            if (elItem.length == 0) {
                elItem = $(template).css("top", "0px");
                elItem.attr("id", "te_" + element.id);
                cont.append(elItem);
                this._setElementEvents(item, elItem);
            }
            elItem.data("data", element);
            elItem.data("parentId", item.attr("id").replace(/^t_/, ''));

            let left = p.pixelsInSencond * element.start + p.offset;
            let width = p.pixelsInSencond * element.content.duration;
            css.left = left;
            css.width = width;

            elItem.css(css);

            if (element.focused)
                elItem.addClass("focused");
            else
                elItem.removeClass("focused");

            if (width >= 18) elItem.removeClass("no-menu");
            else elItem.addClass("no-menu");
            if (width >= 40) elItem.removeClass("no-icon");
            else elItem.addClass("no-icon");
            if (width >= 90) elItem.removeClass("no-image");
            else elItem.addClass("no-image");
            if (width >= 60) elItem.removeClass("no-title");
            else elItem.addClass("no-title");

            let resource = null;
            if (element.asset) {
                resource = element.asset;
            } else if (this._options.onGetAsset) {
                resource = this._options.onGetAsset(element.assetId);
                element.asset = resource;
            }

            if (resource) {
                // console.log(resource);
                elItem.find(".ws-element-text").text(resource.title);
                let bk = null;

                if (resource.info.icon) {
                    let iconPath = "/data/" + resource.info.path + resource.info.icon;
                    if (resource.info.icon) bk = "url(" + iconPath + ") no-repeat center center";
                }
                elItem.find(".ws-element-pict").css({
                    "background": bk,
                    "-webkit-background-size" : "cover",
                    "-moz-background-size:" : "cover",
                    "-o-background-size:" : "cover",
                    "background-size": "cover"
                });
            } else {
                elItem.find(".ws-element-text").text("");
                elItem.find(".ws-element-pict").css({
                    "background": null,
                    "-webkit-background-size" : "cover",
                    "-moz-background-size: cover" : "cover",
                    "-o-background-size: cover" : "cover",
                    "background-size": "cover"
                })
            }

            if (!element.asset && !(resource && resource.content)) {
                elItem.addClass("is-empty").removeClass("dark-gray");
            } else {
                elItem.removeClass("is-empty").addClass("dark-gray");
            }
        }
    }

    _setElementEvents(item, elItem) {

        let that = this;

        this._elementResizeData = {
            stepParams: null,
            prevWidth: null,
            prevLeft: null
        };

        elItem.draggable({
            helper: "clone",
            appendTo: this._options.mainContainer,
            zIndex: 10,
            scroll: false,
            start: (event, ui) => {
                let uiHelper = $(ui.helper);
                uiHelper.addClass("focused");
                uiHelper.data = function() {
                    return {
                        start: elItem.data('data').start,
                        content: {
                            duration: elItem.data('data').content.duration
                        }
                    }
                };
                that._setSideTime.bind(this, uiHelper)();
                elItem.hide();
            },
            over: () => {

            },
            drag: ( event, ui ) => {
                //let track_list = $('ws-tracks-list-content');
                let sc = $('.ws-tracks-list-scroll');
                // scroll treshold
                let st = 10;
                // scroll step
                let ss = 2;
                // scroll position
                let sp = {};
                sp.width = sc.width();
                sp.height = sc.height();
                sp.top = sc.offset().top;
                sp.left = sc.offset().left;

                //drag position
                let dp = ui.offset;

                if (sp.top + st > dp.top) {
                    this._scrollerDiv.scrollerData.scrollBy(0, -ss);
                }
                if (sp.top + sp.height - st < dp.top + 50) { // TODO
                    this._scrollerDiv.scrollerData.scrollBy(0, ss);
                }
                if (sp.left + st > dp.left) {
                    this._scrollerDiv.scrollerData.scrollBy(-ss, 0);
                }
                if (sp.left + sp.width - st < dp.left + 150) { // TODO
                    this._scrollerDiv.scrollerData.scrollBy(ss, 0);
                }

                let stepParams = this._getStepParams();

                let startPos = (this._scrollerDiv.scrollerData.scrollX + ui.position.left - this._container.find('.ws-track-tools-background').width() - stepParams.offset)/stepParams.pixelsInSencond;

                let uiHelper = $(ui.helper);
                uiHelper.data = function(v) {
                    return {
                        start: startPos < 0 ? 0 : startPos,
                        content: {
                            duration: elItem.data('data').content.duration
                        }
                    }
                };

                that._setSideTime.bind(this, uiHelper)();
            },
            stop: (/*event, ui*/) => {
                elItem.show();
                that._setFocusedWithBroadcast.bind(this, elItem)();
            }
        }).resizable({
            handles: 'e, w',
            start: (event, ui) => {
                this._elementResizeData.stepParams = this._getStepParams();
                this._elementResizeData.prevLeft = ui.originalPosition.left;
                this._elementResizeData.prevWidth = ui.originalSize.width;
                that._setSideTime.bind(this, elItem)();
                that._setFocusedWithBroadcast.bind(this, elItem)();
            },
            resize: (event, ui) => {
                this._resizeElement(elItem, event, ui,
                    this._elementResizeData.prevLeft,
                    this._elementResizeData.prevWidth);
                this._elementResizeData.prevLeft = ui.position.left;
                this._elementResizeData.prevWidth = ui.size.width;
                this.render();

                that._setSideTime.bind(this, elItem)();
            },
            stop: (event, ui) => {
                let elementsData = this._resizeElement(item, event, ui,
                    this._elementResizeData.prevLeft,
                    this._elementResizeData.prevWidth);
                this._broadcastEditElement(item, elementsData);
                this._elementResizeData = {
                    stepParams: null,
                    prevWidth: null,
                    prevLeft: null
                };
                that._hideSideTime.bind(this, elItem)();
            }
        }).click(() => {
            if (elItem.hasClass("focused")) return;
            that._setFocusedWithBroadcast.bind(this, elItem)();
        });

        elItem.find(".ws-track-element-menu").click(() => {
            let elementData = elItem.data("data");
            let oldTrackId = elItem.data("parentId");
            let oldTrack = this._findTrack(oldTrackId);

            if (!oldTrack) return;

            for (let i = 0; i < oldTrack.elements.length; i++) {
                if (oldTrack.elements[i].id == elementData.id) {
                    oldTrack.elements.splice(i, 1);
                }
            }

            this._broadcastEditElement(item, oldTrack.elements);
        });

    }

    _setSideTime(elItem) {
        elItem.addClass('ws-track-element-details');
        let elData = elItem.data("data");

        function msToTime(duration) {
            let milliseconds = Math.trunc(+duration%1000)
                , seconds = Math.trunc((+duration)/1000)%60
                , minutes = Math.trunc((+duration)/(1000*60));
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            if (milliseconds > 99) milliseconds = Math.trunc(milliseconds/10);
            milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;
            return minutes + ":" + seconds + ":" + milliseconds;
        }

        let st = elItem.find('.ws-element-left-time');
        let et = elItem.find('.ws-element-right-time');
        st.html(msToTime(elData.start*1000));
        et.html(msToTime((elData.start + elData.content.duration)*1000));
    }

    _hideSideTime(elItem) {
        elItem.removeClass('ws-track-element-details');
    }

    _setFocusedWithBroadcast(elItem) {
        this._container.find(".ws-track-element").removeClass("focused ws-track-element-details").each(function () {
            let elData = $(this).data("data");
            if (elData) elData.focused = false;
        });
        elItem.addClass("focused");
        let elData = elItem.data("data");
        if (elData)elData.focused = true;
        for (let i = 0; i < this._tracks.length; i++) {
            let trItem = $("#t_" + this._tracks[i].id);
            this._broadcastEditElement(trItem, this._tracks[i].elements);
        }
    }

    _resizeElement(item, event, ui, prevLeft, prevWidth) {
        let elementData = $.extend(true, {}, ui.originalElement.data("data"));
        let trackId = ui.originalElement.data("parentId");
        let track = this._findTrack(trackId);
        if (!track) return null;

        let left = ui.position.left;
        let position = {
            dropped :{left: left, top: 0},
            container: {left: 0, top: 0}
        };
        let startTime = this._positionToTime(position);
        position = {
            dropped :{left: left + ui.size.width, top: 0},
            container: {left: 0, top: 0}
        };
        let duration = this._positionToTime(position) - startTime;

        elementData.start = startTime;
        elementData.content.duration = duration;

        let success = this._correctElementsIntersection(track, elementData, event.altKey);

        if (!success) {
            ui.position.left = prevLeft;
            ui.size.width = prevWidth;
        }

        return track.elements;
    }

    _createScroll() {
        // console.log(this._scrollerDiv);
        let scrollerData = {
            viewportWidth: () => this._scrollerDiv.width(),
            viewportHeight: () => this._scrollerDiv.height(),
            scrollMaxWidth: () => this._list.width(),
            scrollMaxHeight: () => this._list.height(),
            scrollX:0,
            scrollY:0,
            scrollAuto: false,
            scrollAutoValue: 0,
            scrollAnimationFrame: null,
            scrollAnimationFrameTime: null,
            scrollBy: (deltaX, deltaY) => {
                if (scrollerData.scrollX + deltaX < 0) {
                    scrollerData.scrollX = 0;
                } else if (scrollerData.scrollMaxWidth() < scrollerData.scrollX + scrollerData.viewportWidth() + deltaX) {
                    scrollerData.scrollX = scrollerData.scrollMaxWidth() - scrollerData.viewportWidth();
                } else {
                    scrollerData.scrollX = scrollerData.scrollX + deltaX;
                }

                if (scrollerData.scrollY + deltaY < 0 || scrollerData.scrollMaxHeight() <= scrollerData.viewportHeight()) {
                    scrollerData.scrollY = 0;
                } else if (scrollerData.scrollMaxHeight() < scrollerData.scrollY + scrollerData.viewportHeight() + deltaY){
                    scrollerData.scrollY = scrollerData.scrollMaxHeight() - scrollerData.viewportHeight();
                } else {
                    scrollerData.scrollY = scrollerData.scrollY + deltaY;
                }

                this._list[0].style.transform = 'translate(' + -scrollerData.scrollX + 'px, ' + -scrollerData.scrollY + 'px)';
                let transform = this._list.css("transform");
                let parts = transform.split(",");
                parts[4] = 0;
                let closeTransform = parts.join(",");
                this._closeButtonsList.css("transform", closeTransform);

                parts = transform.split(",");
                parts[5] = 0;
                let linerTransform = parts.join(",");
                this._linerList.css("transform", linerTransform);

                let p = this._getStepParams();
                let pLeft = "0px";
                if (p) {
                    pLeft = (p.offset + p.pixelsInSencond*this._getAudioState().currentTime -
                        this._pointer.width()/2 - this._scrollerDiv.scrollerData.scrollX -1) + 'px';
                }
                this._pointer.css("left", pLeft);

                this._container.find('.ws-scroller-hor-bar')[0].update();
                this._container.find('.ws-scroller-ver-bar')[0].update();
            },
            horBar: {
                mousedown: false,
                mousedownOffset: 0,
                eventMouseDown: (e) => {
                    this._scrollerDiv.scrollerData.horBar.element.classList.add('ws-scroller-mousedown');
                    this._scrollerDiv.scrollerData.horBar.mousedown = true;
                    this._scrollerDiv.scrollerData.horBar.mousedownOffset = e.clientX;
                    window.addEventListener('mousemove', this._scrollerDiv.scrollerData.horBar.eventMouseMove, false);
                    window.addEventListener('mouseup', this._scrollerDiv.scrollerData.horBar.eventMouseUp, false);
                },
                eventMouseMove: (e) => {
                    let deltaX = this._scrollerDiv.scrollerData.horBar.mousedownOffset - e.clientX;
                    let ratio = this._scrollerDiv.scrollerData.scrollMaxWidth()/this._scrollerDiv.scrollerData.viewportWidth();
                    this._scrollerDiv.scrollerData.horBar.mousedownOffset = e.clientX;
                    this._scrollerDiv.scrollerData.scrollBy(-deltaX*ratio, 0);
                },
                eventMouseUp: (e) => {
                    this._scrollerDiv.scrollerData.horBar.element.classList.remove('ws-scroller-mousedown');
                    this._scrollerDiv.scrollerData.horBar.mousedown = false;
                    window.removeEventListener('mouseup', this._scrollerDiv.scrollerData.horBar.eventMouseUp);
                    window.removeEventListener('mousemove', this._scrollerDiv.scrollerData.horBar.eventMouseMove);
                },
                element: null,
            },
            verBar: {
                mousedown: false,
                mousedownOffset: 0,
                eventMouseDown: (e) => {
                    this._scrollerDiv.scrollerData.verBar.element.classList.add('ws-scroller-mousedown');
                    this._scrollerDiv.scrollerData.verBar.mousedown = true;
                    this._scrollerDiv.scrollerData.verBar.mousedownOffset = e.clientY;
                    window.addEventListener('mousemove', this._scrollerDiv.scrollerData.verBar.eventMouseMove, false);
                    window.addEventListener('mouseup', this._scrollerDiv.scrollerData.verBar.eventMouseUp, false);
                },
                eventMouseMove: (e) => {
                    let deltaY = this._scrollerDiv.scrollerData.verBar.mousedownOffset - e.clientY;
                    let ratio = this._scrollerDiv.scrollerData.scrollMaxHeight()/this._scrollerDiv.scrollerData.viewportHeight();
                    this._scrollerDiv.scrollerData.verBar.mousedownOffset = e.clientY;
                    this._scrollerDiv.scrollerData.scrollBy(0,-deltaY*ratio);
                },
                eventMouseUp: (e) => {
                    this._scrollerDiv.scrollerData.verBar.element.classList.remove('ws-scroller-mousedown');
                    this._scrollerDiv.scrollerData.verBar.mousedown = false;
                    window.removeEventListener('mouseup', this._scrollerDiv.scrollerData.verBar.eventMouseUp);
                    window.removeEventListener('mousemove', this._scrollerDiv.scrollerData.verBar.eventMouseMove);
                },
                element: null,
            }
        };

        this._scrollerDiv.scrollerData = scrollerData;

        this._container.find('.ws-tracks-list')[0].addEventListener('wheel', (e) => {
            e.preventDefault();
            scrollerData.scrollBy(e.deltaX, e.deltaY);
        });

        let horBar = this._container.find('.ws-scroller-hor-bar')[0];
        this._scrollerDiv.scrollerData.horBar.element = horBar;
        horBar.addEventListener('mousedown', this._scrollerDiv.scrollerData.horBar.eventMouseDown);
        horBar.update = () => {
            let ratio = this._scrollerDiv.scrollerData.viewportWidth()/this._scrollerDiv.scrollerData.scrollMaxWidth();
            let horLeft = this._scrollerDiv.scrollerData.scrollX * ratio;
            let horWidth = this._scrollerDiv.scrollerData.viewportWidth() * ratio;
            if(horWidth === this._scrollerDiv.scrollerData.viewportWidth()) {
                horBar.style.display = 'none';
            } else {
                horBar.style.display = 'block';
            }
            horBar.style.width = (horWidth - 10) + 'px';
            horBar.style.left = (10 + horLeft) + 'px';
        };
        horBar.update();

        let verBar = this._container.find('.ws-scroller-ver-bar')[0];
        this._scrollerDiv.scrollerData.verBar.element = verBar;
        verBar.addEventListener('mousedown', this._scrollerDiv.scrollerData.verBar.eventMouseDown);
        verBar.update = () => {
            let ratio = this._scrollerDiv.scrollerData.viewportHeight()/this._scrollerDiv.scrollerData.scrollMaxHeight();
            let verTop = this._scrollerDiv.scrollerData.scrollY * ratio;
            let verHeight = this._scrollerDiv.scrollerData.viewportHeight() * ratio;
            if(verHeight === this._scrollerDiv.scrollerData.viewportHeight()) {
                verBar.style.display = 'none';
            } else {
                verBar.style.display = 'block';
            }
            verBar.style.height = (verHeight - 5) + 'px';
            verBar.style.top = verTop + 'px';
        };
        verBar.update();

        this._scrollerDiv[0].addEventListener('mouseenter', () => {
        });

        this._pointer = $(CWSTracks.template("pointer-top"));
        this._container.find(".ws-tracks-list-content").append(this._pointer);

        $(window).resize(this._onResize.bind(this, horBar, verBar));
    }

    _setToolsEvents() {
        let that = this;
        let addButton = this._container.find("[role='add-panel']");
        addButton.click(function () {
            if (that._options.onAdd) {
                that._options.onAdd();
                //workaround
                setTimeout(()=>{
                    that._scrollerDiv.scrollerData.scrollBy(0,0);
                }, 50)
            }

        });
        let playButton = this._container.find(".ws-tools-top")
            .find(".ws-tools-top-play");
        let pause = playButton.find("[role='pause']");
        let play = playButton.find("[role='play']");
        pause.hide();
        playButton.on('mouseup', function () {
            let audioState = that._getAudioState();
            if (audioState.stopped) {
                that._play();
                play.hide();
                pause.show();
            } else {
                that._pause();
                pause.hide();
                play.show();
                that._scrollerDiv.scrollerData.scrollAuto = false;
                if (that._scrollerDiv.scrollerData.scrollAnimationFrame) {
                    cancelAnimationFrame(that._scrollerDiv.scrollerData.scrollAnimationFrame);
                    that._scrollerDiv.scrollerData.scrollAnimationFrame = null;
                }
            }
        });

        playButton.on('mouseheld', (e) => {
            this._rate.run(e);
        });

        let mute = this._container.find(".ws-mute-button");
        mute.on('click', function() {

            that._toggleMute();

            if (!that._getMute()) {
                $(this).find('.ws-mute-button-on').css({'display': 'block'});
                $(this).find('.ws-mute-button-off').css({'display': 'none'});
            } else {
                $(this).find('.ws-mute-button-on').css({'display': 'none'});
                $(this).find('.ws-mute-button-off').css({'display': 'block'});
            }

        });

        let meter = this._container.find(".ws-volume-meter");

        let meter_mouse_down = false;

        meter.on('mouseenter', function(e) {
            meter.addClass('ws-volume-meter-over')
            meter_mouse_down = false;
        });
        meter.on('mouseleave', function(e) {
            meter.removeClass('ws-volume-meter-over')
            if (meter_mouse_down) that.setVolumeMeter.bind(this, e, that)();
            meter_mouse_down = false;
        });
        meter.on('mousemove', function(e) {
            if (meter.hasClass('ws-volume-meter-over') && meter_mouse_down === true) {
                that.setVolumeMeter.bind(this,e, that)();
            }
        });
        meter.on('mouseup', function(e) {
            if (meter_mouse_down) that.setVolumeMeter.bind(this, e, that)();
            meter_mouse_down = false;
        });
        meter.on('mousedown', function(e) {
            meter_mouse_down = true;
            that.setVolumeMeter.bind(this, e, that)();
        });
    }

    setVolumeMeter(e, that) {
        let m_posx = 0;
        let m_posy = 0;
        let e_posx = 0;
        let e_posy = 0;
        let obj = this;
        //get mouse position on document crossbrowser
        if (!e){e = window.event;}
        if (e.pageX || e.pageY){
            m_posx = e.pageX;
            m_posy = e.pageY;
        } else if (e.clientX || e.clientY){
            m_posx = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            m_posy = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        }
        //get parent element position in document
        if (obj.offsetParent){
            do{
                e_posx += obj.offsetLeft;
                e_posy += obj.offsetTop;
                obj = obj.offsetParent
            } while (obj);
        }

        let meter = {
            'x': (m_posx-e_posx),
            'y': (m_posy-e_posy)
        };

        let meterValue = $(this).height() - meter.y;
        if (meterValue > $(this).height()) meterValue = $(this).height();
        let meterRatio = 100/$(this).height();

        $(this).find(".ws-volume-value").css({'height': meterValue + 'px'});
        that._setVolume((meterValue * meterRatio)/100);
    }

    _getAudioState() {
        if (this._options.onGetAudioState) return this._options.onGetAudioState();
        return null;
    }

    _play() {
        if (this._options.onPlay) this._options.onPlay();
    }

    _pause() {
        if (this._options.onPause) this._options.onPause();
    }

    _setPosition(position) {
        if (this._options.onSetPosition) this._options.onSetPosition(position);
    }

    _getMute() {
        if (this._options.onGetMute) return this._options.onGetMute();
    }

    _toggleMute() {
        if (this._options.onToggleMute) this._options.onToggleMute();
    }

    _setVolume(volume) {
        if (volume < 0) volume = 0;
        else if (volume > 1) volume =1;
        if (this._options.onSetVolume) this._options.onSetVolume(volume);
    }

    _setRate(rate) {
        if (this._options.onSetRate) this._options.onSetRate(rate);
    }

    _setRateText(rate) {
        let rateDiv = this._container.find(".ws-tools-top").find(".ws-tools-top-text[role='rate']");
        rateDiv.text(rate);
    }

    _setDeleteBtnEvents(deleteBtn) {
        let that = this;
        deleteBtn.click(function () {
            let id = $(this).attr("data-track");
            if (that._options.onDelete) that._options.onDelete({id: id});
        });
    }

    _setTrackEvents(item) {
        let cont = item.children(".ws-track-content");
        cont.droppable({
            accept: (el) => {
                return el.hasClass("ws-assets-item") ||
                    el.hasClass("ws-track-element") ||
                    el.hasClass("ws-palette-btn");
            },
            drop: ( event, ui ) => {
                if (ui.draggable.hasClass("ws-assets-item"))
                    this._onDropAsset(item, event, ui);
                else if (ui.draggable.hasClass("ws-track-element"))
                    this._onDropElement(item, event, ui);
                else
                    this._onDropPaletteBtn(item, event, ui);
            }
        });
    }

    _onDropPaletteBtn(item, event, ui) {
        let hOffset = ui.helper.offset();
        let position = {
            dropped :{left: hOffset.left, top: hOffset.top},
            container: item.offset()
        };

        let trackId = item.attr("id").replace(/^t_/, '');;
        let track = this._findTrack(trackId);

        let startTime = this._positionToTime(position);
        let p = this._getStepParams();

        let element = {
            id: Utils.guid(),
            asset: null,
            start: startTime,
            content: {
                duration: p.duration,
                track: trackId,
                position: {
                    left: 0,
                    top: 0,
                    right: 30,
                    bottom: 40
                },
            },
            effects:[
                {"type": "zoom", "start": 0, "duration": 0, "acceleration": 0}
            ],
        };

        let type = ui.draggable.attr("role") == "add-image" ? "image" : "text";

        // console.log(type)
        track.elements.push(element);

        if (type == "image") {
            element.data = {
                title: "New image",
                fileName: null,
                type,
                size: {width: 0, height: 0},
                icon: null,
                content: null
            }
            this._newElemData = element;
            this._fileInput.click();
        } else if (type == "text") {
            element.data = {
                title: "New text",
                fileName: null,
                type,
                size: {width: 0, height: 0},
                icon: null,
                content: 'New text',
                sizes: [60, 50, 40],
                ratio: 0.5,
                currentSize: 0,
            }
            // this._newElemData = element;
        }

        if (this._correctElementsIntersection(track, element, event.altKey))
            this._broadcastAddElement(item, track.elements);
        // this._selectImage(element);
    }

    // _selectImage(element) {
    //
    // }
    // _selectText()

    _onDropAsset(item, event, ui) {
        let hOffset = ui.helper.offset();
        let position = {
            dropped :{left: hOffset.left, top: hOffset.top},
            container: item.offset()
        };

        let trackId = item.attr("id").replace(/^t_/, '');
        let track = this._findTrack(trackId);


        let startTime = this._positionToTime(position);
        let p = this._getStepParams();
        let assData = ui.draggable.data("data");
        // player ratio is 16:9
        // if player width = 160, then 30% is
        let w = 30;
        let actualWidth = 160 * 0.3;
        let pictRatio = assData.info.size.height / assData.info.size.width;
        let actualHeight = actualWidth * pictRatio;
        // calculate actualHeight's %
        let h = actualHeight / 90 * 100;

        let element = {
            id: Utils.guid(),
            assetId: assData.id,
            asset: assData,
            start: startTime,
            position: {
                left: 0,
                top: 0,
                right: 100 - w,
                bottom: 100 - h
            },
            content: {
                duration: p.duration,
                track: trackId
            },
            effects:[
                {"type": "zoom", "start": 0, "duration": 0, "acceleration": 0}
            ]
        };
        track.elements.push(element);
        if (this._correctElementsIntersection(track, element, event.altKey))
            this._broadcastAddElement(item, track.elements);
    }

    _onDropElement(item, event, ui) {
        let elementData = ui.draggable.data("data");
        let oldTrackId = ui.draggable.data("parentId");
        let newTrackId = item.attr("id").replace(/^t_/, '');;
        let oldTrack = this._findTrack(oldTrackId);
        let newTrack = this._findTrack(newTrackId);

        if (!(oldTrack && newTrack)) return;
        if (oldTrack != newTrack) {
            for (let i = 0; i < oldTrack.elements.length; i++) {
                if (oldTrack.elements[i].id == elementData.id) {
                    oldTrack.elements.splice(i, 1);
                }
            }
            elementData.content.track = newTrack.id;
            newTrack.elements.push(elementData);
        }

        let hOffset = ui.helper.offset();
        let position = {
            dropped :{left: hOffset.left, top: hOffset.top},
            container: item.offset()
        };

        let startTime = this._positionToTime(position);
        elementData.start = startTime;
        newTrackId = item.attr("id").replace(/^t_/, '');

        if (this._correctElementsIntersection(newTrack, elementData, event.altKey)) {
            if (oldTrackId == newTrackId)
                this._broadcastEditElement(item, newTrack.elements);
            else
                this._broadcastMoveElement(item, oldTrackId, newTrack.elements, oldTrack.elements);
        }
    }

    _broadcastMoveElement(item, oldTrackId, elementsData, oldTrackElementsData) {
        let trackId = item.attr("id").replace(/^t_/, '');
        if (this._options.onMoveElement) {
            this._options.onMoveElement({
                track: trackId,
                oldTrackId: oldTrackId,
                elements: elementsData,
                oldTrackElements: oldTrackElementsData
            });
        }
    }

    _broadcastEditElement(item, element) {
        let trackId = item.attr("id").replace(/^t_/, '');
        if (this._options.onEditElement) {
            this._options.onEditElement({track: trackId, elements: element});
        }
    }

    _broadcastDeleteElement(elementId) {
        if (this._options.onDeleteElement) {
            this._options.onDeleteElement(elementId);
        }
    }

    _broadcastAddElement(item, elements) {
        let trackId = item.attr("id").replace(/^t_/, '');
        if (this._options.onAddElement) {
            this._options.onAddElement({track: trackId, elements: elements});
        }
    }

    _positionToTime(position) {
        let p = this._getStepParams();
        let left = position.dropped.left - p.offset - position.container.left;
        if (left < 0) return 0;
        let start = left / p.pixelsInSencond;
        return start;
    }

    _renderLiner(audioState) {
        let that = this;
        let liner = this._container.find(".ws-track-liner").find(".ws-liner-list");
        let p = this._getStepParams(audioState);
        let offset = p.offset;

        if (!this._linerSteps) {
            this._linerSteps = [];
            let zeroStep = this._getLinerObject(0, offset, 0);
            this._linerSteps.push(zeroStep);
            liner.append(zeroStep.step);
            //liner.append(zeroStep.text);
        }

        if (this._linerSteps.length > p.count + 1) {
            for (let i = p.count + 1; i < this._linerSteps.length; i ++) {
                this._linerSteps[i].step.remove();
                this._linerSteps[i].text.remove();
            }

            this._linerSteps.splice(p.count + 1);
        }

        let i = 0;
        let left = 0;
        while (i < p.count) {
            let curStepObj = null;
            left = offset + (i*p.width);
            let point = i*p.duration;
            if (i + 1 < this._linerSteps.length) {
                curStepObj = this._linerSteps[i + 1];
                curStepObj.step.css({left: left + "px", width: p.width});
                curStepObj.text.css({left: left + "px"});
                let s = this._getStepText(point);
                let d = curStepObj.text.find("div");
                d.text(s.text);
                d.css("opacity", s.opacity);
            } else {
                curStepObj = this._getLinerObject(left, p.width, point);
                this._linerSteps.push(curStepObj);
                liner.append(curStepObj.step);
                liner.append(curStepObj.text);
            }
            i++;
        }

        let lw = liner.parent().width();
        let w = 0;
        if (lw > left + p.width) {
            left += p.width;
            let curStepObj = this._getLinerObject(left, lw - left, i*p.duration);
            this._linerSteps.push(curStepObj);
            liner.append(curStepObj.step);
            liner.append(curStepObj.text);
            w = left + (lw - left);
        } else {
            w = left + p.width;
        }

        this._linerList.digitsBar = {
            mousedown: false,
            mousedownOffset: 0,
            liner: liner,
            eventMouseDown: (e) => {
                e.stopImmediatePropagation();
                this._linerList.digitsBar.mousedown = true;
                this._linerList.digitsBar.mousedownOffset = e.clientX;

                let position = {
                    dropped :{left: e.clientX, top: e.clientY},
                    container: this._linerList.digitsBar.liner.offset()
                };
                let startTime = that._positionToTime(position);
                that._setPosition(startTime);
                that._setPositionEnd();
                that._scrollerDiv.scrollerData.scrollBy(0,0); // alt refresh
                that._setDurationMeter();

                window.addEventListener('mousemove', this._linerList.digitsBar.eventMouseMove, false);
                window.addEventListener('mouseup', this._linerList.digitsBar.eventMouseUp, false);
            },
            eventMouseMove: (e) => {
                let position = {
                    dropped :{left: e.clientX, top: e.clientY},
                    container: this._linerList.digitsBar.liner.offset()
                };
                let startTime = that._positionToTime(position);
                that._setPosition(startTime);
                that._setPositionEnd();
                that._scrollerDiv.scrollerData.scrollBy(0,0);
                that._setDurationMeter();
            },
            eventMouseUp: (e) => {
                this._linerList[0].classList.remove('ws-scroller-mousedown');
                this._linerList.digitsBar.mousedown = false;
                window.removeEventListener('mouseup', this._linerList.digitsBar.eventMouseUp);
                window.removeEventListener('mousemove', this._linerList.digitsBar.eventMouseMove);
            }
        }

        this._linerList[0].addEventListener('mousedown', this._linerList.digitsBar.eventMouseDown, false);

        liner.width(w);
        this._resetHorizontalScroll(w);
    }

    _resetHorizontalScroll(linerWidth) {
        let list = this._scrollerDiv.find(".list");
        list.width(linerWidth);
    }

    _getStepParams(audioState) {
        let liner = this._container.find(".ws-track-liner");
        let fSize = liner.css('font-size').replace("px", "");
        let zoomState = this._zoomState;
        if (!zoomState) return null;
        let stepDuration = zoomState.params.step;
        let stepWidth = zoomState.params.stepWidth;

        let result = {
            duration: stepDuration,
            width: stepWidth,
            fontSize: Number(fSize),
            pixelsInSencond: stepWidth/stepDuration,
            offset: Number(fSize)
        };
        audioState = audioState || this._getAudioState();
        let count = Math.floor(audioState.duration / result.duration);
        if (count * result.duration < audioState.duration) count++;
        result.count = count;

        return result;
    }

    _getLinerObject(left, width, point) {
        let result = {
            step: $(CWSTracks.template("liner-step")),
            text: $(CWSTracks.template("liner-text"))
        };

        result.step.css({width: width + "px", left: left + "px"});
        result.text.css({width: "auto", left: left + "px"});

        let s = this._getStepText(point);
        let d = result.text.find("div");
        d.text(s.text);
        d.css("opacity", s.opacity);

        return result;
    }

    initAudio(audioState) {
        audioState = audioState || this._getAudioState();

        this._zoomState = {
            params: this._getMaxStep(audioState),
            position: 0
        }

        this.renderAudioState(audioState);
        this._renderLiner(audioState);
        this._renderZoom(true, audioState);
        this.render();
    }

    renderAudioState(audioState) {
        audioState = audioState || this._getAudioState();
        let audio = audioState.audio;
        if (!audio) {
            this._clearAudioRender();
            return;
        }

        this._setDurationMeter();
        this._altScrollToPointer();
    }

    _setDurationMeter() {
        function msToTime(duration) {
            duration = +duration;
            let milliseconds = Math.trunc(duration%1000)
                , seconds = Math.trunc((duration/1000)%60)
                , minutes = Math.trunc(duration/(1000*60));
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            if (milliseconds > 99) milliseconds = Math.trunc(milliseconds/10);
            milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;
            return minutes + ":" + seconds + ":" + milliseconds;
        }
        let durStr = msToTime(this._getAudioState().currentTime*1000);
        let durDiv = this._container.find(".ws-tools-top").find(".ws-tools-top-text[role='duration']");
        durDiv.text(durStr);
    }

    _animationFrame(timestamp) {
        let state = this._getAudioState();
        let fps = 30;
        let interval = 1000/fps;
        let scrollBy = (this._getStepParams().pixelsInSencond/fps) * state.playbackRate;

        if (timestamp >= this._scrollerDiv.scrollerData.scrollAnimationFrameTime) {
            //missed step
            this._scrollerDiv.scrollerData.scrollAnimationFrameTime = timestamp + interval;
        }

        this._scrollerDiv.scrollerData.scrollBy(scrollBy, 0);
        if (this._scrollerDiv.scrollerData.scrollAnimationFrame && !state.stopped)
            this._scrollerDiv.scrollerData.scrollAnimationFrame =
                requestAnimationFrame(this._animationFrame.bind(this));
        else
            this._scrollerDiv.scrollerData.scrollAuto = false;
    }

    _altScrollToPointer() {

        let audioState = this._getAudioState();
        let p = this._getStepParams();
        if (!audioState.stopped) {
            let pos = PTR_SCROLL_NONE;
            let pPos = this._getPointerLeft(audioState.currentTime)
            if (pPos < 0) pos = PTR_SCROLL_LEFT;
            else if (pPos >= this._scrollerDiv.width() - PTR_SCROLL_BOUND) pos = PTR_SCROLL_RIGHT;

            if (pos === PTR_SCROLL_RIGHT) {
                if (!this._scrollerDiv.scrollerData.scrollAuto) {
                    this._scrollerDiv.scrollerData.scrollAuto = true;
                    this._scrollerDiv.scrollerData.scrollAnimationFrame = requestAnimationFrame(this._animationFrame.bind(this));
                    this._scrollerDiv.scrollerData.scrollAnimationFrameTime = performance.now();
                } else {

                    if (parseFloat(this._pointer.css('left')) > this._scrollerDiv.scrollerData.viewportWidth()) {
                        // console.log('m')
                        this._scrollerDiv.scrollerData.scrollBy(parseFloat(this._pointer.css('left')) - this._scrollerDiv.scrollerData.viewportWidth()+ PTR_SCROLL_BOUND, 0);
                    }
                }
            }
            if (pos === PTR_SCROLL_NONE) {
                if (this._scrollerDiv.scrollerData.scrollAuto) {
                    this._scrollerDiv.scrollerData.scrollAuto = false;
                    if (this._scrollerDiv.scrollerData.scrollAnimationFrame) {
                        cancelAnimationFrame(this._scrollerDiv.scrollerData.scrollAnimationFrame);
                        this._scrollerDiv.scrollerData.scrollAnimationFrame = null;
                    }
                } else {
                    let p = this._getStepParams();
                    this._pointer.css("left", (p.offset + p.pixelsInSencond*this._getAudioState().currentTime - this._pointer.width()/2 - this._scrollerDiv.scrollerData.scrollX) + 'px');
                }
            }
            if (pos === PTR_SCROLL_LEFT) {
                this._scrollerDiv.scrollerData.scrollBy(parseFloat(this._pointer.css('left')), 0);
            }
        }
    }

    _getPointerLeft(curPos) {
        let p = this._getStepParams();

        let transform = this._linerList.css("transform");
        let offset = 0;
        let parts = transform.split(",");
        if (parts.length > 1)
            offset = Number.parseFloat(parts[4].trim());

        let left = p.offset + p.pixelsInSencond*curPos - this._pointer.width()/2 + offset;

        return left;
    }

    _setPositionEnd() {
        if (this._options.onSetPositionEnd) this._options.onSetPositionEnd();
    }

    _clearAudioRender() {
        let div = this._container.find(".ws-tools-top").find(".ws-tools-top-text[role='duration']");
        div.text("00:00:00");
    }

    _onResize(horBar, verBar) {
        horBar.update();
        verBar.update();
        let cont = this._container.find(".ws-tracks-list-content");
        let b1 = cont.find(".ws-track-liner").find(".ws-liner-list");
        let b2= cont.find(".ws-tracks-list-scroll").find(".list");
        b1.width(b1.parent().width());
        b2.width(b2.parent().width());

        this._renderLiner(this._getAudioState());
    }


    _correctElementsIntersection(track, editedData, shift) {
        let audioState = this._getAudioState();

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

    setElementPosition(elementId, position) {
        let el = this._findElement(elementId);
        let pos = $.extend(true, {}, position);
        el.content.position = pos;
    }

    setTextElementData(elementId, data) {
        let newData = $.extend(true, {}, data);

        for (let i = 0; i < this._tracks.length; i++) {
            let track = this._tracks[i];
            for (let j = 0; j < track.elements.length; j++) {
                if (track.elements[j].id == elementId) {
                    track.elements[j].data = newData;
                    break;
                }
            }
        }

    }

    setFocused(elementId) {
        let oldFocused = null;
        for (let i = 0; i < this._tracks.length; i++) {
            let track = this._tracks[i];
            for (let j = 0; j < track.elements.length; j++) {
                let el = track.elements[j];
                if (el.focused) {
                    el.focused = false;
                    oldFocused = el;
                    break;
                }
            }
        }
        let el = this._findElement(elementId);
        el.focused = true;
        this.render();
        return oldFocused;
    }

    _findTrack(id) {
        let tracks = this._tracks;
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

    _findElement(id) {
        for (let i = 0; i < this._tracks.length; i++) {
            let track = this._tracks[i];
            for (let j = 0; j < track.elements.length; j++) {
                if (track.elements[j].id == id) return track.elements[j];
            }
        }

        return null;
    }

    _findTrackByElement(id) {
        for (let i = 0; i < this._tracks.length; i++) {
            let track = this._tracks[i];
            for (let j = 0; j < track.elements.length; j++) {
                if (track.elements[j].id == id) return track;
            }
        }

        return null;
    }

    _renderZoom(reposPointer, audioState) {
        if (reposPointer) {
            this._circle.css("left", this._zoomState.position);
        }

        this._renderLiner(audioState);
    }

    _getMaxZoomPosition() {
        let lw = this._line.width();
        let cw = this._circle.width();
        return lw - cw/2;
    }

    _recalcZoomState(position) {
        let maxStep = this._getMaxStep();
        let intervalCount = maxStep.idx * 2 + 1;
        let maxZoomPos = this._getMaxZoomPosition();
        position = maxZoomPos - position;
        let zoomStepWidth = maxZoomPos / intervalCount;
        let intervalIdx = Math.floor(position / zoomStepWidth);
        this._zoomState.position = position;
        let idx = Math.floor(intervalIdx/2);
        this._zoomState.params = {
            idx: idx,
            step: steps[idx],
            type: (intervalIdx%2 == 0 ? STEP_TYPE_MAX : STEP_TYPE_MIN),
            stepWidth: (intervalIdx%2 == 0 ? STEP_WIDTH_MAX : STEP_WIDTH_MIN)
        }
    }

    _getStepText(point) {
        let state = this._zoomState;

        if (point > 0) {
            if (state.params.step <= 2) {
                if  (point%10 == 0)
                    return {text: point + "с", opacity: 0.8};
                else
                    return {text: String(point%10), opacity: 0.3};
            } else if (state.params.step <= 5) {
                if (point%10 == 0)
                    return {text: point + "с", opacity: 0.8};
                else
                    return {text: "5", opacity: 0.3};
            } else if (state.params.step <= 20) {
                if (point%60 == 0) {
                    let s = Math.floor(point/60);
                    if (s < 10) s = "0" + s;
                    else s = String(s);
                    s += ":00м";
                    return {text: s, opacity: 0.8};
                } else {
                    return {text: String(point%60) + "с", opacity: 0.3};
                }
            } else if (state.params.step <= 30) {
                if (point%60 == 0) {
                    let s = Math.floor(point/60);
                    if (s < 10) s = "0" + s;
                    else s = String(s);
                    s += ":00м";
                    return {text: s, opacity: 0.8};
                } else
                    return {text: "30с", opacity: 0.3};
            }
        }

        return {text: String(point), opacity: 0.3};
    }

    _getMaxStep(audioState) {
        audioState = audioState || this._getAudioState();
        let duration = audioState.duration;
        let linerWidth = this._container.find(".ws-track-liner").width();

        let visStepsCount = linerWidth / STEP_WIDTH_MIN;
        let idealStemWeight = duration / visStepsCount;
        let maxStep = steps[steps.length - 1];
        let idx = steps.length - 1;
        for (let i = 1; i < steps.length; i++) {
            if (steps[i] >= idealStemWeight) {
                maxStep = steps[i];
                idx = i;
                break;
            };
        }

        return {
            idx: idx,
            step: maxStep,
            type: STEP_TYPE_MIN,
            stepWidth: STEP_WIDTH_MIN
        };
    }
}
//}
//);
