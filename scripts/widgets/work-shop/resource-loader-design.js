import CWSResourceLoader from "./resource-loader"
//define(
//    [
//        "./resource-loader"
//    ],
//    function (CWSResourceLoader) {
export default class CWSResourceLoaderDesign extends CWSResourceLoader {
    changeElements(trackId, elements) {
        let data = this._state.data;
        if (!data.episodes || data.episodes.length == 0) return;
        // дизайнер работает только с одним эпизодом
        let ep = data.episodes[0];
        let tIdx = ep.tracksIdx[trackId];
        if (tIdx === undefined) return;
        let track = ep.tracks[tIdx];

        let trackElements = track.elements;

        // delete not existent elements
        for (let i = 0; i < trackElements.length;) {
            let found = CWSResourceLoaderDesign._findElementById(trackElements[i].id, elements);
            if (!found) {
                trackElements.splice(i, 1);
            } else {
                i++;
            }
        }

        // update/insert rest elements
        for (let i = 0; i < elements.length; i ++) {
            let found = CWSResourceLoaderDesign._findElementById(elements[i].id, trackElements);
            if (!found) {
                let newEl = $.extend(true, {}, elements[i]);
                trackElements.push(newEl);
            } else {
                let oldEl = found.element;
                trackElements[found.idx] = $.extend(true, oldEl, elements[i]);
            }

            found = CWSResourceLoaderDesign._findElementById(elements[i].id, ep.elements);
            if (!found) {
                let newEl = $.extend(true, {}, elements[i]);
                ep.elements.push(newEl);
            } else {
                let oldEl = found.element;
                ep.elements[found.idx] = $.extend(true, oldEl, elements[i]);
            }
        }
    }

    addTrack(track) {
        let data = this._state.data;
        if (!data.episodes || data.episodes.length == 0) return;
        // дизайнер работает только с одним эпизодом
        let ep = data.episodes[0];
        let newTrack = $.extend(true, {}, track)

        ep.tracksIdx[newTrack.id] = ep.tracks.length;
        ep.tracks.push(newTrack);
    }

    static _findElementById(id, elements) {
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].id != id) continue;
            return {idx: i, element: elements[i]};
        }

        return null;
    }
}
//    }
//);