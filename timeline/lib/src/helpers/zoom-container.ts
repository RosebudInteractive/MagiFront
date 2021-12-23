import { IScrollable } from '../types/common';

class ZoomContainer implements IScrollable {
  private readonly div: HTMLElement;

  constructor(container: HTMLElement) {
    this.div = container;
  }

  scrollTo(value: number) {
    this.div.scroll(value, 0);
  }

  get scrollLeft(): number {
    return this.div.scrollLeft;
  }
}

export default function wrap(div: HTMLElement): IScrollable {
  return new ZoomContainer(div);
}
