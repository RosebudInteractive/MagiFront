import $ from "jquery";

const K2 = 1;

export const isLandscape = function () {
    return $(window).outerHeight() * K2 < $(window).outerWidth();
}