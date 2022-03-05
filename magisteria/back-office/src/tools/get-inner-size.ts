type ElementSize = { width: number, height: number };

export default function getInnerSize(element: HTMLElement): ElementSize {
  let width = 0;
  let height = 0;

  if (element) {
    const rect: DOMRect = element.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    const cs = getComputedStyle(element);

    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

    const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

    width = element.offsetWidth - paddingX - borderX;
    height = element.offsetHeight - paddingY - borderY;
  }

  return { width, height };
}
