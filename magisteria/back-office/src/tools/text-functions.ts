// eslint-disable-next-line import/prefer-default-export
export function getWidthOfText(txt: string, fontName: string, fontSize: string): number {
  // @ts-ignore
  if (getWidthOfText.c === undefined) {
    // @ts-ignore
    getWidthOfText.c = document.createElement('canvas');
    // @ts-ignore
    getWidthOfText.ctx = getWidthOfText.c.getContext('2d');
  }
  // @ts-ignore
  getWidthOfText.ctx.font = `${fontSize} ${fontName}`;
  // @ts-ignore
  return getWidthOfText.ctx.measureText(txt).width;
}
