/**
 * Created by levan.kiknadze on 27/05/2017.
 */
import CWSBase from "./ws-base";
import tpl from 'text!./templates/work-shop.html';

//define(
//    ["./ws-base", 'text!./templates/work-shop.html'],
//    function (CWSBase, tpl) {
const URL_PREFIX = "/data/";
export default class CWSAssets extends CWSBase {

    constructor(container, options){
        super(container, tpl);
        this._scrollerDiv = container.find(".ws-assets-content");
        this._list = this._scrollerDiv.children("div.list");
        this._createScroll();
        this._setUserEvents();
        this._options = options;
    }

    /**
     * render assets list
     * @param assets array of asset objects:
     * {
             * "id": "GUID",
             * "title": "some title",
             * "type": "PNG/JPEG/SVG/MP3/....",
             * "size": "800x600/5Mb/43:18",
             * "icon": "URL/ON/SERVER???",
             * "content": "URL/ON/SERVER???"
             * "contentSize": { width: width, height: height}
             * }
     */
    render(assets) {
        let template = CWSAssets.template("asset");
        let assetsGuids = {};
        assets = assets || [];
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i];
            assetsGuids["a_" + asset.id] = true;
            let item = this._list.find("#a_" + asset.id);
            if (item.length == 0) {
                item = $(template);
                item.attr("id", "a_" + asset.id);
                if (asset.type == "MP3") item.attr("role", "audio");
                this._list.append(item);
                this._setAssetItemEvents(item);
                item.data("data", asset);
            }

            item.find(".ws-assets-item-num-cont").text(i + 1);
            let title = "";
            if (asset.type == "MP3") {
                title = asset.title + "<br>";
                let d = new Date(asset.duration * 1000).toISOString().substr(11, 8);
                title += d;
                let icon = item.find(".ws-assets-item-icon");
                if (icon.children().length == 0) {
                    let div = $("<div/>");
                    icon.append(div);
                    div.addClass("ws-audio-icon").text("♫");
                }
            } else {
                title = asset.title + "<br>" + asset.info.size.width + "x" + asset.info.size.height;
                item.find(".ws-assets-item-icon")
                    .css({
                        "background": "url(" + URL_PREFIX + asset.info.path + asset.info.icon + ") no-repeat center center",
                        "-webkit-background-size" : "cover",
                        "-moz-background-size: cover" : "cover",
                        "-o-background-size: cover" : "cover",
                        "background-size": "cover"
                        // "background-size": "4em 3.5em"
                    });
            }
            item.find(".ws-assets-text").html(title);

        }

        this._list.children().each(function () {
            if (!assetsGuids[$(this).attr("id")])
                $(this).remove();
        });

        this._iscroll.refresh();
    }

    _setAssetItemEvents(item) {
        item.click(() => {
            if (item.hasClass("focused")) return;
            this._container.find(".ws-assets-item").removeClass("focused");
            item.addClass("focused");
        });
        if (item.attr("role") != "audio") {
            item.draggable({
                helper: "clone",
                appendTo: this._options.mainContainer,
                zIndex: 10,
                scroll: false,
                start: (event, ui) => {
                    $(ui.helper).addClass("focused");
                }
            });

            item.find(".ws-assets-item-menu").click(() => {
                this._deleteAsset(item);
            });
        }
    }

    _deleteAsset(item) {
        let id = item.attr("id");
        this._broadcastDeleteAsset(id);
    }

    _createScroll() {
        if (this._iscroll) {
            this._iscroll.destroy();
            this._iscroll = null;
        }

        this._iscroll = new IScroll(this._scrollerDiv[0], {
            snapStepY: 23,
            scrollX: false,
            scrollY: true,
            bottomPadding: 0,
            topPadding: 0,
            resize: true,
            scrollbars: true,
            mouseWheel: true,
            disableMouse: true,
            interactiveScrollbars: true,
            keyBindings: false,
            click: true,
            probeType: 3,
            rightPadding: 0
        });

    }

    _setUserEvents() {
        let that = this;
        let fileInput = that._container.find(".ws-assets-top").children("input");
        this._container.find(".ws-assets-plus").click(function () {
            fileInput.click();
        });

        fileInput.change(function (evt) {
            let files = evt.target.files; // FileList object

            // Loop through the FileList and render image files as thumbnails.
            for (let i = 0, f; f = files[i]; i++) {

                // Only process image files.
                if (!f.type.match('image.*')) {
                    continue;
                }

                let reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        let dataUrl = e.target.result;
                        let base64 = dataUrl.split(',')[1];
                        let img = $("<img style='display: none'/>");
                        that._container.append(img);
                        img.load(function () {
                            let size = {
                                width: this.naturalWidth,
                                height: this.naturalHeight
                            };
                            that._broadcastAddAsset(theFile.name, base64, size);
                        });
                        img.attr("src", dataUrl);
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            }

        });
    }

    _broadcastAddAsset(name, base64, size) {
        if (this._options && this._options.onAdd) {
            this._options.onAdd({
                filename: name,
                body: base64,
                size: size
            });
        }
    }

    _broadcastDeleteAsset(id) {
        if (this._options && this._options.onDelete) {
            this._options.onDelete({
                id: id
            });
        }
    }

    destroy() {
        this._unSetUserEvents();

        this._list.children().each((index, value) => {
            let item = $(value);
            item.off('click');
            if (item.attr("role") != "audio") {
                item.draggable("destroy");
                item.find(".ws-assets-item-menu").off("click");
            }
        });
    }

    _unSetUserEvents() {
        let fileInput = this._container.find(".ws-assets-top").children("input");
        this._container.find(".ws-assets-plus").off("click");
        fileInput.off("change");
    }
}
//    }
//);
