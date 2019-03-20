import $ from "jquery";

const AVAILABLE_FOR = {
    COURSE: 'COURSE',
    BOOK: 'BOOK',
    COURSE_AND_BOOK: 'COURSE_AND_BOOK',
}

const AVAILABLE_LINKS = {
    'www.ozon.ru': {name: 'ozon', availableFor: AVAILABLE_FOR.BOOK},
    'www.labirint.ru': {name: 'labirint', availableFor: AVAILABLE_FOR.BOOK},
    'www.litres.ru': {name: 'litres', availableFor: AVAILABLE_FOR.COURSE},
    'ru.bookmate.com': {name: 'bookmate', availableFor: AVAILABLE_FOR.COURSE_AND_BOOK},
    'www.storytel.com': {name: 'storytel', availableFor: AVAILABLE_FOR.COURSE},
    'zvukislov.ru': {name: 'zvukislov', availableFor: AVAILABLE_FOR.COURSE},
}

export class ExtLinkObject {
    constructor(url) {
        try {
            this._link = new URL(url);
        } catch (e) {
            this._link = null;
        }
    }

    isValid() {
        let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!this._link && pattern.test(this._link.href);
    }

    host() {
        return this._link.host
    }
}

export const checkExtLinks = (links) => {
    if (!links) return null

    let _arrayOfLines = links.match(/[^\r\n]+/g);

    let _result = []

    _arrayOfLines.forEach((link) => {
        if (!link) return;

        let _extLink = new ExtLinkObject(link)

        if (!_extLink.isValid()) {
            _result.push(link)
        } else {
            let _availableLink = AVAILABLE_LINKS[_extLink.host()],
                _linkNotAllowed = (!_availableLink)
                    || ((_availableLink.availableFor !== AVAILABLE_FOR.COURSE)
                        && (_availableLink.availableFor !== AVAILABLE_FOR.COURSE_AND_BOOK))

            if (_linkNotAllowed) {
                _result.push(link)
            }
        }
    })

    return _result
}

export const checkBookExtLinks = (links) => {
    if (!links) return null

    let _arrayOfLines = links.match(/[^\r\n]+/g);

    let _result = []

    _arrayOfLines.forEach((link) => {
        if (!link) return;

        let _extLink = new ExtLinkObject(link);
        if (!_extLink.isValid()) {
            _result.push(link)
        } else {
            let _availableLink = AVAILABLE_LINKS[_extLink.host()],
                _linkNotAllowed = (!_availableLink)
                    || ((_availableLink.availableFor !== AVAILABLE_FOR.BOOK)
                        && (_availableLink.availableFor !== AVAILABLE_FOR.COURSE_AND_BOOK))

            if (_linkNotAllowed) {
                _result.push(link)
            }
        }
    })

    return _result
}

export const getExtLinks = (links) => {
    if (!links) return null

    let _arrayOfLines = links.match(/[^\r\n]+/g);

    let _result = {}

    _arrayOfLines.forEach((link) => {
        let _extLink = new ExtLinkObject(link);
        if (_extLink.isValid()) {
            _result[_extLink.host()] = link
        }
    })

    if (!$.isEmptyObject(_result)) {
        return JSON.stringify(_result)
    } else {
        return null
    }
}

export const convertLinksToString = (data) => {
    if (!data) return null;

    try {
        let _linksObject = JSON.parse(data)
        let _result = [];

        for (let prop in _linksObject) {
            if (_linksObject.hasOwnProperty(prop))
                _result.push(_linksObject[prop]);
        }

        return _result.join('\r\n');
    } catch (e) {
        return null
    }
}
