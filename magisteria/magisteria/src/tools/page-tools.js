import $ from "jquery";
import Platform from 'platform'

const addDevWarn = (text) => {
    let _dev = $('#dev'),
        isVisible = _dev.is(':visible');

    if (isVisible === true) {
        if (!_dev.children().last() || (_dev.children().last().text() !== text))
            _dev.append($('<div style="position:  relative; color:darkgreen">' + text + '</div>'))
    }
}

export const getShareURL = () => {
    return window.location.protocol + '//' + window.location.host + window.location.pathname;
}

export function isMobile() {
    return window.matchMedia("(max-width: 899px)").matches
}

export function isPhoneViewPort() {
    return window.matchMedia("(max-width: 649px)").matches
}

export const isInViewport = (selector, margin) => {
    let _margin = margin ? +margin : 0

    let _this = $(selector);
    if (!_this || !_this.length) { return }

    let elementTop = _this.offset().top;
    let elementBottom = elementTop + _this.outerHeight() - _margin;

    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
}

export const pages = {
    courses: {name: 'courses', url: '/'},
    singleCourse: {name: 'singleCourse', url: null},
    lesson: {name: 'lesson', url: null},
    player: {name: 'player', url: null},
    transcript: {name: 'transcript', url: null},
    bookmarks: {name: 'bookmarks', url: '/favorites'},
    purchases: {name: 'purchases', url: '/purchases'},
    author: {name: 'author', url: null},
    profile: {name: 'profile', url: '/profile'},
    history: {name: 'history', url: '/history'},
    test: {name: 'test', url: null},
    notFound: {name: 'not-found', url: null},
    about: {name: 'about', url: null},
    search: {name: 'search', url: null},
}

export const ImageSize = {
    icon: 'icon',
    small: 's',
    medium: 'm',
    large: 'l'
}

export const getImagePath = (fileInfo, size) => {
    let _fileName = '';

    if ((fileInfo.MetaData) && (fileInfo.MetaData.content) && (fileInfo.MetaData.content[size])) {
        _fileName = fileInfo.MetaData.path + fileInfo.MetaData.content[size]
    } else {
        _fileName = fileInfo.FileName
    }

    return _fileName;
}

export const getCoverPath = (coverOwner, size) => {
    let _fileName = '';

    if ((coverOwner.CoverMeta) && (coverOwner.CoverMeta.content)) {
        if (size === ImageSize.icon) {
            if (coverOwner.CoverMeta.icon) {
                _fileName = coverOwner.CoverMeta.path + coverOwner.CoverMeta.icon
            }
        } else {
            if (coverOwner.CoverMeta.content[size]) {
                _fileName = coverOwner.CoverMeta.path + coverOwner.CoverMeta.content[size]
            }
        }
    }

    _fileName = _fileName ? _fileName : coverOwner.Cover

    return _fileName;
}

export const getAuthorPortraitPath = (author, size) => {
    let _fileName = '';

    if (author.PortraitMeta && author.PortraitMeta.content) {
        if (size === ImageSize.icon) {
            if (author.PortraitMeta.icon) {
                _fileName = author.PortraitMeta.path + author.PortraitMeta.icon
            }
        } else {
            if (author.PortraitMeta.content[size]) {
                _fileName = author.PortraitMeta.path + author.PortraitMeta.content[size]
            }
        }
    }

    _fileName = _fileName ? _fileName : author.Portrait

    return '/data/' + _fileName;
}

export const getLessonNumber = (lesson) => {
    return lesson ?
        lesson.Parent ?
            lesson.Parent.Number + '.' + lesson.Number
            :
            lesson.Number
        :
        ''
}

export const widthLessThan900 = () => {
    return window.innerWidth < 900
}

export const fadeTimeout = 5000;

export const getDomain = () => {
    return window.location.protocol + '//' + window.location.host
}

export const getDomainImagesPath = () => {
    return getDomain() + '/data/';
}

export const getPageUrl = () => {
    return getDomain() + window.location.pathname;
}

export const TooltipTitles = {
    locked : '?????? ?????????????????? ???????? ???????????? ???????????????????? ???????????????????????????? ???? ??????????',
    play: '???????????? ????????????????',
    replay : '?? ????????????',
    pause: '??????????',
    IS_PAID: '?????? ?????????????????? ???????????? ???????????????????? ???????????? ????????',
}

let _isOverflowEnable = false,
    _scrollPos = 0,
    _internalPos = 0

export class OverflowHandler {
    static get enable() {
        return _isOverflowEnable
    }

    static get scrollPos() {
        return _scrollPos
    }

    static rememberScrollPos() {
        _scrollPos = getScrollPage()
    }

    static turnOn() {
        if (!_isOverflowEnable || !$('body').hasClass('overflow')) {
            _internalPos = getScrollPage()
            $('body').addClass('overflow');
            $('body').addClass('overflow_fixed');
            _isOverflowEnable = true;
        }
    }

    static turnOnWithPause() {
        if (!_isOverflowEnable || !$('body').hasClass('overflow')) {
            _internalPos = getScrollPage()
            $('body').addClass('overflow');
            setTimeout(() => {
                $('body').addClass('overflow_fixed');
            }, 700)

            _isOverflowEnable = true;
        }
    }

    static turnOff() {
        if (_isOverflowEnable || $('body').hasClass('overflow')) {
            _scrollPos = 0;
            $('body').removeClass('overflow');
            $('body').removeClass('overflow_fixed');
            _isOverflowEnable = false;
            window.scrollTo(0, _internalPos)
            _internalPos = 0
        }
    }

    static setPositionAfterTurnOff(value) {
        _internalPos = value
    }
}

export const getScrollPage = () => {
    let _docScrollTop = 0;

    if (document.documentElement && document.documentElement !== null) {
        _docScrollTop = document.documentElement.scrollTop;
    }

    return window.pageYOffset || _docScrollTop;
};

window.$overflowHandler = OverflowHandler;

export const isMobilePlatform = () => {
    return (Platform.os.family === "Android") || isMobileAppleDevice() || (Platform.os.family === "Windows Phone")
}

export const isSafariOnMac = () => {
    return (Platform.os.family === "OS X") && (Platform.name === "Safari")
}

// ?????????? ???????????????? ?????????????????? ?????? ???????? ?????????? ???????????????????? ?????????????????? "???????????? ?????????????????????? ??????-??????????"
// ?????? ?????? ?????? ???? ?????????????????? ???????????? ???????????????????????? ?????? ???????????????????? ?? ???? mac OS X 10.15
export const isIOSWithEnabledDesktopBrowser = () => {
    const _ua = window.navigator.userAgent.toLowerCase();

    return _ua.indexOf('macintosh') > -1 && 'ontouchend' in document
}

export const isMobileAppleDevice = () => {
    const _isTrueIOS = Platform.os.family === "iOS"

    return _isTrueIOS || isIOSWithEnabledDesktopBrowser()
}

export const isIOS13 = () => {
    if (Platform.os.family === "iOS") {
        let _version = Platform.os.version.split('.')
        return +_version[0] > 12
    } else {
        return false
    }
}

export const getIOSVersion = () => {
    if (Platform.os.family === "iOS") {
        let _version = Platform.os.version.split('.')
        return +_version[0]
    } else {
        return false
    }
}

export const getCurrencySign = () => {
    if (Platform.os.family === "Android") {
        let _version = Platform.os.version.split('.')
        if (+_version[0] < 5) {
            return "??"
        }
    }

    // ?????? ???????????????????????? ?????????? ?????????? ?????????? ???????????????????? ???? 13 ????????????
    if (isIOS13()) {
        return "??"
    }

    if (isIOSWithEnabledDesktopBrowser()) {
        return "??"
    }

    return "???"
}
