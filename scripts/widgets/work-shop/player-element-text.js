import CWSPlayerElement from "./player-element"

export default class CWSPlayerElementText extends CWSPlayerElement {
    _calcMaxSize() {
        this._options.data.content.position.bottom = 0;
        this._options.data.content.position.right = 0;
        this._options.data.content.position.left = 0;
        this._options.data.content.position.top = 0;
    }

    _initItem(item) {
        let ass = this.Asset;
        let cont = item.find(".ws-player-elem-content");

        if (ass) {
            let textToolsDiv = $('.ws-text-element-tools');
            let textDiv = document.createElement('div');
            textDiv.classList.add('ws-text-element');
            textDiv.id = Utils.guid();

            textDiv.contentEditable = "false";

            textDiv._textTools = {
                setRatio: (ratio) => {
                    setTimeout(() => {
                        this._options.data.data.ratio = ratio;
                        this._broadcastSetTextData();
                        textDiv._textTools.update();
                    }, 50)
                },
                setCurrentSize: (size) => {
                    setTimeout(() => {
                        this._options.data.data.currentSize = size;
                        this._broadcastSetTextData();
                        textDiv._textTools.update();
                    }, 50)
                },
                update: () => {
                    textDiv.style.fontSize = (this._options.data.data.sizes[this._options.data.data.currentSize] * this._options.data.data.ratio) + 'px';
                }
            };

            let selectionchangeFn = () => {
                let s = window.getSelection();
                let oRange = s.getRangeAt(0);
                let oRect = oRange.getBoundingClientRect();
                $(textToolsDiv).css({
                    'top': oRect.top - 30,
                    'left': oRect.right - $(textToolsDiv).width() / 2 - oRect.width / 2
                });

                let parents = [];
                let colors = [];
                let parentEl = oRange.commonAncestorContainer;
                let progress = true;

                while (progress) {
                    if (parentEl.classList !== undefined) {
                        if (!parentEl.classList.contains('ws-text-element')) {
                            parents.push(parentEl)
                            colors.push(parentEl.style.backgroundColor);
                        } else {
                            progress = false;
                        }
                    }
                    if (parentEl.parentNode !== null) {
                        parentEl = parentEl.parentNode;
                    } else {
                        progress = false;
                    }
                }
                // console.log({parents, colors});
            };

            let overTools = false;

            let mousemoveFn = (e) => {
                let rect = $.extend({}, textDiv.getBoundingClientRect());
                let rect2 = textToolsDiv[0].getBoundingClientRect();

                if (rect.left <= e.clientX && rect.right >= e.clientX && rect.top <= e.clientY && rect.bottom >= e.clientY ||
                    rect2.left <= e.clientX && rect2.right >= e.clientX && rect2.top <= e.clientY && rect2.bottom >= e.clientY) {
                    overTools = true
                } else overTools = false;
            };

            textDiv.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!overTools) {
                        textDiv.contentEditable = "false";
                        $(textToolsDiv).removeClass('ws-text-element-tools-show');
                        if (item.hasClass('ui-draggable')) item.draggable('enable');
                        document.removeEventListener('mousemove', mousemoveFn);
                        document.removeEventListener("selectionchange", selectionchangeFn);
                    }
                }, 100);
            });

            textDiv.addEventListener('blur', () => {
                setTimeout(() => {
                    this._options.data.data.content = $(textDiv).html();
                    this._broadcastSetTextData();
                }, 50);
            });

            textDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.textId = textDiv.id;
                textDiv.contentEditable = "true"
                item.draggable('disable');
                textDiv.focus();
                $(textToolsDiv).addClass('ws-text-element-tools-show');
                document.addEventListener('mousemove', mousemoveFn);
                document.addEventListener("selectionchange", selectionchangeFn);
                let oRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
                $(textToolsDiv).css({
                    'top': oRect.top - 30,
                    'left': oRect.right - $(textToolsDiv).width() / 2 - oRect.width / 2
                });
                $('.ws-text-element-tools-a').each((index, item) => {
                    $(item).removeClass('ws-text-element-tools-a-selected');
                });
                $('.ws-text-element-tools-a' + (this._options.data.data.currentSize + 1)).addClass('ws-text-element-tools-a-selected')
                return false
            });

            $(textDiv).html(resource.content);
            textDiv._textTools.update();
            cont.html(textDiv);
        } else {
            let imgDiv = $('<img src="" />');
            cont.html(imgDiv);

            this._setEvents(item);
            item.fadeIn("fast");
        }
    }
}