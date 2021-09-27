export function getWidthOfText(txt, fontName, fontSize, fontWeight) {
    if (getWidthOfText.c === undefined) {
        getWidthOfText.c = document.createElement('canvas');
        getWidthOfText.ctx = getWidthOfText.c.getContext('2d');
    }
    getWidthOfText.ctx.font = `${fontSize} ${fontName} ${fontWeight}`;
    return getWidthOfText.ctx.measureText(txt).width;
}
