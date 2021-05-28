export function getWidthOfText(txt, fontName, fontSize) {
    if (getWidthOfText.c === undefined) {
        getWidthOfText.c = document.createElement('canvas');
        getWidthOfText.ctx = getWidthOfText.c.getContext('2d');
    }
    getWidthOfText.ctx.font = fontSize + ' ' + fontName;
    return getWidthOfText.ctx.measureText(txt).width;
}
