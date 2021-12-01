let canvas;
let context;
export default function getWidthOfText(txt, fontName, fontSize, fontWeight) {
    if (canvas === undefined) {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
    }
    const font = `${fontWeight} ${fontSize}px ${fontName}`;
    // eslint-disable-next-line no-console
    console.log(font);
    context.font = font;
    return context.measureText(txt).width;
}
