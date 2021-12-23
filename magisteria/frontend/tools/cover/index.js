import $ from "jquery";

const K1 = 1,
      K2 = 1

let _landscapeHeight = 0;

export class Desktop {
    static isLandscape() {
        let _width = $(window).innerWidth(),
            _height = $(window).innerHeight();

        return (_width * K1) > _height
    }

    static getLandscapeHeight() {
        return $(window).innerHeight();
    }

    static getLandscapeWidth() {
        return $(window).innerWidth();
    }
}

export class Mobile {
    static isLandscape() {
        return $(window).outerHeight() * K2 < $(window).outerWidth();
    }

    static getLandscapeHeight() {
        if (_landscapeHeight < $(window).outerHeight()) {
            _landscapeHeight = $(window).outerHeight()
        }

        let _menu = $('.lectures-menu'),
            _menuHeight = (!!_menu && (_menu.length > 0)) ? _menu.height() : 0

        return _landscapeHeight - _menuHeight
    }


    static getLandscapeWidth() {
        return ""
    }
}


// export const isDesktopLandscape = function () {
//     let _width = $(window).innerWidth(),
//         _height = $(window).innerHeight();
//
//     return (_width * K1) > _height
// }
//
// export const isMobileLandscape = function () {
//     return $(window).outerHeight() * K2 < $(window).outerWidth();
// }