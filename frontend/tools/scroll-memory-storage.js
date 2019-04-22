const ENTER = 'enter'

export default class ScrollMemoryStorage {
    constructor() {
        this._url = new Map()
        this._courses = new Map()
    }

    static setUrlPosition(key, value) {
        let _key = key || ENTER
        _instance._setUrlPosition(_key, value)
    }

    _setUrlPosition(key, value) {
        this._url.set(key, {position: value, active: false})
    }

    static setKeyActive(key) {
        let _key = key || ENTER
        _instance._setKeyActive(_key)
    }

    _setKeyActive(key) {
        let _object = this._url.get(key)
        if (_object) {
            _object.active = true
        }
    }

    static scrollPage(key) {
        let _key = key || ENTER,
            _object = _instance._url.get(_key)

        if (_object && _object.active) {
            scrollTo(_object.position)
            _instance._hasBeenScrolled(_key)
        }
    }

    _hasBeenScrolled(key) {
        let _key = key || ENTER
        let _object = this._url.get(_key)
        if (_object) {
            _object.active = false
        }
    }

    static saveCourseBundlesHeight(courses) {
        _instance._saveCourseBundlesHeight(courses)
    }

    _saveCourseBundlesHeight(courses) {
        this._courses.clear()

        let _bundles = courses.children();
        for (let i = 0; i < _bundles.length - 1; i++) {
            this._courses.set(i, _bundles[i].clientHeight)
        }
    }

    static getInstance() {
        return _instance
    }

    getCourseBundleHeight(index) {
        return this._courses.get(index)
    }
}

/**
 * scroll to y number of a page
 * @param {number} position
 * @return {void}
 */

const scrollTo = (position) => {
    window.requestAnimationFrame(() => {window.scrollTo(500, position) });
};

let _instance = new ScrollMemoryStorage()