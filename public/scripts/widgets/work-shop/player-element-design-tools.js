
export default class CWSElementDesignTools {
    static broadcastPosition(callback, trackElId, position) {
        if (callback)
            callback({
                trackElId: trackElId,
                position: $.extend(true, {}, position)
            });
    }

    static recalcSize(container, event, ui) {
        let pixWidth = ui.size.width;
        let pixHeight = ui.size.height;

        let contWidth = container.width();
        let contHeight = container.height();

        let right = 0;
        let bottom = 0;
        let left = 0;
        let top = 0;

        if (contWidth > 0) {
            right = (contWidth - ui.position.left - pixWidth)/contWidth * 100;
            left = ui.position.left/contWidth * 100;
        }
        if (contHeight > 0) {
            bottom = (contHeight - pixHeight - ui.position.top)/contHeight * 100;
            top = ui.position.top/contHeight * 100;
        }

        return {
            bottom: bottom,
            right: right,
            left: left,
            top: top
        }
    }

    static recalcPosition(container, position, event, ui) {
        //this._options.data.position.left
        let pixLeft = ui.position.left;
        let pixTop = ui.position.top;

        let contWidth = container.width();
        let contHeight = container.height();

        let left = 0;
        let top = 0;
        if (contWidth > 0) left = pixLeft/contWidth * 100;
        if (contHeight > 0) top = pixTop/contHeight * 100;

        let right =
            position.right - (left - position.left);
        let bottom =
            position.bottom - (top - position.top);

        return {
            bottom: bottom,
            right: right,
            left: left,
            top: top
        }
    }

}