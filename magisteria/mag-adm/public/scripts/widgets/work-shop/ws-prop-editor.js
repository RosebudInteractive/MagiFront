/**
 * Created by levan.kiknadze on 28/06/2017.
 */
import CWSBase from "./ws-base";
import tpl from 'text!./templates/work-shop.html';

//define(
//    ["./ws-base", 'text!./templates/work-shop.html'],
//    function (CWSBase, tpl) {
function clearSelection() {
    if ( document.selection ) {
        document.selection.empty();
    } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }
}

export default class CWSPropEditor extends CWSBase {
    constructor(container, options){
        super(container, tpl);
        this._scrollerDiv = container;
        this._options = options;
    }

    render(data) {
        if (data) this._options.data = data;
        if (!this._options.data.content.position)
            this._calcMaxSize();
        if (!this._options.data.effects)
            this._options.data.effects = [];

        let template = CWSPropEditor.template("prop-editor");
        let item = this._container.children(".ws-prop-editor-main");
        if (item.length == 0) {
            item = $(template);
            this._container.append(item);
            this._createScroll();
        }
        this.renderProperties(item);
        this._setupEditableDivs();
        this._fillFreeSpace(item);
        this._iscroll.refresh();
    }

    _calcMaxSize() {
        let ass = this._options.data.asset;
        if (!this._options.data.content.position)
            this._options.data.content.position = {};

        if (!ass || !ass.info || ass.info.type === 'text') {
            this._options.data.content.position.bottom = 0;
            this._options.data.content.position.right = 0;
            this._options.data.content.position.left = 0;
            this._options.data.content.position.top = 0;
        } else {
            let h = ass.info.size.height,
                w = ass.info.size.width;
            let pictRatio = w ? h / w : 1;
            w = 100;
            let actualWidth = 160 * 1;
            let actualHeight = actualWidth * pictRatio;
            // calculate actualHeight's %
            h = actualHeight / 90 * 100;

            if (h > 100) {
                h = 100;
                actualHeight = 90 * 1;
                actualWidth = actualHeight / pictRatio;
                w = actualWidth / 160 * 100;
            }
            if (!this._options.data.content.position)
                this._options.data.content.position = {};

            this._options.data.content.position.left = 50 - w / 2;
            this._options.data.content.position.right = 50 - w / 2;
            this._options.data.content.position.top = 50 - h / 2;
            this._options.data.content.position.bottom = 50 - h / 2;
        }
    }

    renderProperties(item) {

    }

    destroy() {
        let item = this._container.children(".ws-prop-editor-main");
        if (item.length != 0) {
            this._iscroll.destroy();
            this._iscroll = null;
            item.remove();
        }
    }

    _createScroll() {
        let that = this;
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

        this._iscroll.on("scroll", function () {
        })

    }

    _setupEditableDivs () {
        let that = this;
        this._container.find(".ws-contenteditable").off().dblclick(function() {
            $(this).attr('contenteditable', 'true');
            clearSelection();
            $(this).trigger('focus');
        }).on('focus', function() {
            let ctrl = $(this);
            that._textBefore = ctrl.text();
            ctrl.parent().parent().parent().addClass("editing");
        }).on('blur', function() {
            let ctrl = $(this);
            ctrl.attr('contenteditable', 'false');
            ctrl.text(ctrl.text().replace(/(\r\n|\n|\r)/gm,""));

            if (that._textBefore != ctrl.text()) { ctrl.trigger('change'); }
            ctrl.parent().parent().parent().removeClass("editing");

        }).on('keypress', function(event) {
            // ESC=27, Enter=13
            if (event.which == 27) {
                $(this).text(that._textBefore);
                $(this).trigger('blur');
            } else if (event.which == 13) {
                $(this).trigger('blur');
            }
            event.stopPropagation();
        }).on('change', function() {
            let $thisText = $(this).text();
            let role = $(this).attr("role");
            if (that._propChange(role, $thisText) === false) {
                $(this).text(that._textBefore);
                $(this).trigger("blur");
            }
        }).click(function () {
            if ($(this).is(":focus")) {
                event.stopPropagation();
            }
        });
    }

    _propChange(role, text) {
    }

    _fillFreeSpace(parent) {
        let template = CWSPropEditor.template("prop-editor-panel");

        let pItem = parent.find(".ws-prop-panel[role='fill']");
        if (pItem.length == 0) {
            pItem = $(template).attr("role", "fill").addClass("fill");
            parent.append(pItem);
        }

        let h = 0;
        parent.find(".ws-prop-panel").each(function () {
            let item = $(this);
            if (item.attr("role") == "fill") return;
            h += item.height();
        });

        let fillHeight = this._scrollerDiv.height() - h;
        if (fillHeight > 0) {
            pItem.show();
            pItem.height(fillHeight);
        } else {
            pItem.hide();
        }
    }
}
//    }
//);