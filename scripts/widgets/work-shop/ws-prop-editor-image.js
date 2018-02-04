/**
 * Created by levan.kiknadze on 28/06/2017.
 */

define(
    ["./ws-prop-editor", 'text!./templates/work-shop.html'],
    function (CWSPropEditor, tpl) {
        return class CWSPropEditorImage extends CWSPropEditor {
            constructor(container, options){
                super(container, options);
            }

            renderProperties(parent) {
                this._renderTitle(parent);
                this._renderPosition(parent);
                for (var i = 0; i < this._options.data.effects.length; i++) {
                    this._renderEffect(parent, this._options.data.effects[i], i);
                }
                this._renderDescription(parent);
            }

            _renderTitle(parent) {
                var template = CWSPropEditor.template("prop-editor-panel");
                var elData = this._options.data;

                var pItem = parent.find(".ws-prop-panel[role='title']");
                if (pItem.length == 0) {
                    pItem = $(template).attr("role", "title").addClass("title");
                    parent.append(pItem);
                }


                var resource = this._getResource(elData);

                var title = "";
                if (resource) {
                    title = resource.title + "<br>" +
                    resource.size.width + "x" +
                    resource.size.height;
                }
                pItem.empty();
                pItem.append("<div class='ws-prop-caption'/>");
                pItem.children().html(title);
            }

            _getResource(elData) {
                var ass = elData.asset;
                var resource = null;
                if (ass) {
                    resource = ass.body;
                } else if (elData.data) {
                    resource = elData.data;
                }

                return resource;
            }

            _renderPosition(parent) {
                var template = CWSPropEditor.template("prop-editor-panel");
                var templateIcon = CWSPropEditor.template("prop-editor-icon-panel");
                var data = this._options.data;

                var pItem = parent.find(".ws-prop-panel[role='icon']");
                if (pItem.length == 0) {
                    pItem = $(template).attr("role", "icon");
                    pItem.append($(templateIcon));
                    parent.append(pItem);
                }

                var resource = this._getResource(data);

                var content = pItem.children();

                var bk = null;
                if (resource && resource.icon) bk = "url(" + resource.icon + ") no-repeat center center";

                content.find(".icon")
                    .css({
                      "background": bk,
                      "-webkit-background-size" : "cover",
                      "-moz-background-size: cover" : "cover",
                      "-o-background-size: cover" : "cover",
                      "background-size": "cover"
                    });
                content.find(".left div").text(data.position.left.toFixed(2) + "%");
                content.find(".right div").text(data.position.right.toFixed(2) + "%");
                content.find(".top div").text(data.position.top.toFixed(2) + "%");
                content.find(".bottom div").text(data.position.bottom.toFixed(2) + "%");
            }

            _renderEffect(parent, effect, i) {
                var template = CWSPropEditor.template("prop-editor-panel");
                var templateEditor = CWSPropEditor.template("prop-editor-zoom-panel");

                var pItem = parent.find(".ws-prop-panel[role='zoom-effect']");
                if (pItem.length == 0) {
                    pItem = $(template).attr("role", "zoom-effect");
                    pItem.append($(templateEditor));
                    parent.append(pItem);
                }

                if (typeof effect.start == "string")
                    effect.start = Number.parseFloat(effect.start)
                if (typeof effect.duration == "string")
                    effect.duration = Number.parseFloat(effect.duration)
                if (typeof effect.acceleration == "string")
                    effect.acceleration = Number.parseFloat(effect.acceleration)

                pItem.find("[role='start']").text(effect.start.toFixed(1))
                pItem.find("[role='duration']").text(effect.duration.toFixed(1))
                pItem.find("[role='acceleration']").text(effect.acceleration.toFixed(1))
            }

            _renderDescription(parent) {
                var template = CWSPropEditor.template("prop-editor-panel");
                var templateEditor = CWSPropEditor.template("prop-editor-desc-panel");
                var data = this._options.data;
                data.description = data.description || "";

                var pItem = parent.find(".ws-prop-panel[role='description-panel']");
                if (pItem.length == 0) {
                    pItem = $(template).attr("role", "description-panel");
                    pItem.append($(templateEditor));
                    parent.append(pItem);
                }

                pItem.find("[role='description']").text(data.description)
            }

            _propChange(role, text) {
                super._propChange(role, text);
                console.log('_props?')

                var result = false;
                if ("start,duration,acceleration".indexOf(role) >= 0) {
                    if (!$.isNumeric(text)) return false;
                    var num = Number.parseFloat(text);

                    if (this._options.data.effects.length > 0 && num !== false) {
                        num = num.toFixed(1);
                        this._options.data.effects[0][role] = num;
                        result = num;
                    }
                } else if (role == "description") {
                    this._options.data.description = result = text;
                }

                if (this._options.onPropertyChanged) this._options.onPropertyChanged({
                    property: role,
                    data: $.extend(true, {}, this._options.data)
                });

                return result;
            }
        }
    }
);
