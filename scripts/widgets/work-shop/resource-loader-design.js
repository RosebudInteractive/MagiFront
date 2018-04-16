import CWSResourceLoader from "./resource-loader"
//define(
//    [
//        "./resource-loader"
//    ],
//    function (CWSResourceLoader) {
export default class CWSResourceLoaderDesign extends CWSResourceLoader {
    _getEpisode() {
        let data = this._state.data;
        if (!data.episodes || data.episodes.length == 0) return null;
        // дизайнер работает только с одним эпизодом
        let ep = data.episodes[0];

        return ep
    }

    // do not call this method for deletion!
    // Because of here we don't know if we must delete element from ep.elements array too
    changeElements(trackId, elements) {
        let ep = this._getEpisode();
        if (!ep) return;
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
            let newEl = null;
            if (!found) {
                newEl = $.extend(true, {}, elements[i]);
                trackElements.push(newEl);
            } else {
                let oldEl = found.element;
                newEl = $.extend(true, oldEl, elements[i]);
                trackElements[found.idx] = newEl;
            }

            found = CWSResourceLoaderDesign._findElementById(elements[i].id, ep.elements);
            if (!found) {
                ep.elements.push(newEl);
            } else {
                ep.elements[found.idx] = newEl;
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

    setElementPosition(e) {
        let trackElId = e.trackElId;

        let ep = this._getEpisode();
        if (!ep) return;

        for (let i = 0; i < ep.tracks.length; i++) {
            let trackElements = ep.tracks[i].elements;
            let el = CWSResourceLoaderDesign._findElementById(trackElId, trackElements);
            if (el) {
                el.element.content.position = $.extend(true, {}, e.position);
                break;
            }
        }

        let el = CWSResourceLoaderDesign._findElementById(trackElId, ep.elements);
        if (el) {
            el.element.content.position = $.extend(true, {}, e.position);
        }
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