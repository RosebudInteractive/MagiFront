import $ from "jquery";

const availableLinks = {
    'www.ozon.ru': 'ozon',
    'www.labirint.ru': 'labirint',
    'www.litres.ru': 'litres',
    'ru.bookmate.com': 'bookmate',
    'www.storytel.com': 'storytel',
    'zvukislov.ru': 'zvukislov',
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

        let _extLink = new ExtLinkObject(link);
        if (!_extLink.isValid() || (!availableLinks[_extLink.host()])) {
            _result.push(link)
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
