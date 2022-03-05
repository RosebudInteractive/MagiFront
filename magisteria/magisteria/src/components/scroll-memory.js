import React from 'react';
import {withRouter} from 'react-router-dom';
import ScrollMemoryStorage from '../tools/scroll-memory-storage'

class ScrollMemory extends React.Component {

    componentDidMount() {
        window.addEventListener("popstate", ScrollMemory.detectPop);
    }

    componentWillUnmount() {
        window.removeEventListener("popstate", ScrollMemory.detectPop);
    }

    shouldComponentUpdate(nextProps) {
        if (!isBrowser()) return false;

        const _location = this.props.location,  // location before change url
            actual = _location,                 // location after change url
            next = nextProps.location,          // the first page has not key, set "enter" for key
            key = actual.key || "enter",        // if hash => let the normal operation of the browser
            locationChanged = (next.pathname !== actual.pathname || next.search !== actual.search) && next.hash === "", // get scroll of the page or the element before change location
            scroll = this.props.elementID ? getScrollElement(this.props.elementID) : getScrollPage();

        if (locationChanged) {
            if (window.$overflowHandler && window.$overflowHandler.enable) {
                ScrollMemoryStorage.setUrlPosition(key, window.$overflowHandler.scrollPos);
            } else {
                ScrollMemoryStorage.setUrlPosition(key, scroll);
            }
        } // never render

        return false;
    }

    static detectPop(location) {
        if (!isBrowser()) return;

        const state = location && location.state, // key or enter page
            key = state ? state.key : "enter" // get the next for scroll position

            ScrollMemoryStorage.setKeyActive(key); // if find in url map => scroll to position
    }

    render() { return null; }
}



/**
 * get the scroll of page
 * @return {number}
 */
const getScrollPage = () => {
    let docScrollTop = 0;

    if (document.documentElement) {
        docScrollTop = document.documentElement.scrollTop;
    }

    return window.pageYOffset || docScrollTop;
};
/**
 * get the scroll of a parent element
 * @return {number}
 */

const getScrollElement = (elementId) => {
    let elemScrollTop = 0,
        element = document.getElementById(elementId);

    if (element !== null) {
        elemScrollTop = element.scrollTop;
    }

    return elemScrollTop;
};

/**
 * verif if window exist
 * @return boolean
 */

const isBrowser = () => {
    return typeof window !== "undefined";
};

export default withRouter(ScrollMemory);