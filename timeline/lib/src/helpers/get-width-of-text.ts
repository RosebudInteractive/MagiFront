let canvas: HTMLCanvasElement;
let context: any;

export default function getWidthOfText(
  txt: string,
  fontName: string,
  fontSize: number,
  fontWeight: string,
): number {
  if (canvas === undefined) {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
  }

  context.font = `${fontWeight} ${fontSize}px ${fontName}`;
  return context.measureText(txt).width;
}
