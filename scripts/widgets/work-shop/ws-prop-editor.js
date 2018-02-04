/**
 * Created by levan.kiknadze on 28/06/2017.
 */

define(
    ["./ws-base", 'text!./templates/work-shop.html'],
    function (CWSBase, tpl) {
        function clearSelection() {
            if ( document.selection ) {
                document.selection.empty();
            } else if ( window.getSelection ) {
                window.getSelection().removeAllRanges();
            }
        }

        return class CWSPropEditor extends CWSBase {
            constructor(container, options){
                super(container, tpl);
                this._scrollerDiv = container;
                this._options = options;
            }

            render(data) {
                if (data) this._options.data = data;
                var template = CWSPropEditor.template("prop-editor");
                var item = this._container.children(".ws-prop-editor-main");
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

            renderProperties(item) {

            }

            destroy() {
                var item = this._container.children(".ws-prop-editor-main");
                if (item.length != 0) {
                    this._iscroll.destroy();
                    this._iscroll = null;
                    item.remove();
                }
            }

            _createScroll() {
                var that = this;
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
                var that = this;
                this._container.find(".ws-contenteditable").off().dblclick(function() {
                    $(this).attr('contenteditable', 'true');
                    clearSelection();
                    $(this).trigger('focus');
                }).on('focus', function() {
                    var ctrl = $(this);
                    that._textBefore = ctrl.text();
                    ctrl.parent().parent().parent().addClass("editing");
                }).on('blur', function() {
                    var ctrl = $(this);
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
                    var $thisText = $(this).text();
                    var role = $(this).attr("role");
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
                var template = CWSPropEditor.template("prop-editor-panel");

                var pItem = parent.find(".ws-prop-panel[role='fill']");
                if (pItem.length == 0) {
                    pItem = $(template).attr("role", "fill").addClass("fill");
                    parent.append(pItem);
                }

                var h = 0;
                parent.find(".ws-prop-panel").each(function () {
                    var item = $(this);
                    if (item.attr("role") == "fill") return;
                    h += item.height();
                });

                var fillHeight = this._scrollerDiv.height() - h;
                if (fillHeight > 0) {
                    pItem.show();
                    pItem.height(fillHeight);
                } else {
                    pItem.hide();
                }
            }
        }
    }
);