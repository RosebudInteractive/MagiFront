import $ from "jquery";
import {getScrollPage} from "tools/page-tools";

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

    static turnOnOverflowFixed() {
        if (!_isOverflowEnable || !$('body').hasClass('overflow')) {
            _internalPos = getScrollPage()
            $('body').addClass('overflow');
            $('body').addClass('overflow_fixed');
            _isOverflowEnable = true;
        }
    }

    static turnOnOverflow() {
        if (!_isOverflowEnable || !$('body').hasClass('overflow')) {
            _internalPos = getScrollPage()
            $('body').addClass('overflow');
            _isOverflowEnable = true;
        }
    }

    static turnOnOverflowFixedWithPause() {
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