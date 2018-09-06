import $ from "jquery";

const K1 = 1;

export const isLandscape = function () {
    let _width = $(window).innerWidth(),
        _height = $(window).innerHeight();

    return (_width * K1) > _height
}