let _instance =  null

export default class ScrollMemoryStorage {
    constructor() {
        this._url = new Map()
    }

    static setUrlPosition(key, value) {
        _instance._setUrlPosition(key, value)
    }

    _setUrlPosition(key, value) {
        this._url.set(key, {position: value, active: false})
    }

    static setKeyActive(key) {
        _instance._setKeyActive(key)
    }

    _setKeyActive(key) {
        let _object = this._url.get(key)
        if (_object) {
            _object.active = true
        }
    }

    static scrollPage(key) {
        let _object = _instance._url.get(key)

        if (_object && _object.active) {
            scrollTo(_object.position)
            _instance._hasBeenScrolled(key)
        }

    }

    _hasBeenScrolled(key) {
        let _object = this._url.get(key)
        if (_object) {
            _object.active = true
        }
    }
}

/**
 * scroll to y number of a page
 * @param {number} position
 * @return {void}
 */

const scrollTo = (position) => {
    window.requestAnimationFrame(() => {window.scrollTo(0, position) });
};

_instance = new ScrollMemoryStorage()