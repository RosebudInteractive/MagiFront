import { IScrollable } from '../types/common';
import SETTINGS from '../timeline/settings';

export enum OffsetEnum { LEFT = 'left', CENTER = 'center', RIGHT = 'right' }

type Offset = OffsetEnum | number;

class ZoomHandler {
  private scrollContainer: IScrollable | null;

  private width: number = 0;

  private zoom: number;

  private offset: Offset;

  private scrollPosition: number = 0;

  constructor() {
    this.scrollContainer = null;
    this.zoom = 1;
    this.offset = OffsetEnum.CENTER;
  }

  setContainer(container: IScrollable) {
    this.scrollContainer = container;
  }

  setWidth(value: number) {
    this.width = value;
  }

  getOffset(): number {
    if (typeof this.offset === 'number') return this.offset;

    switch (this.offset) {
      case OffsetEnum.LEFT: return 0;
      case OffsetEnum.CENTER: return this.width / 2;
      case OffsetEnum.RIGHT: return this.width;

      default: return 0;
    }
  }

  setOffset(value: OffsetEnum | number) {
    this.offset = value;
  }

  setScrollPosition(value: number) {
    this.scrollPosition = value;
  }

  adjustForNewOffset(newValue: number, newZoom: number) {
    if (this.scrollContainer) {
      const delta = newValue - this.getOffset();
      this.scrollContainer.scrollTo(this.scrollPosition + delta);
    }

    this.zoom = newZoom;
  }

  centrifyPosition(newValue: number) {
    if (this.scrollContainer) {
      const delta = newValue - (this.scrollPosition + this.width / 2);
      this.scrollContainer.scrollTo(this.scrollPosition + delta);
    }
  }

  getZoomToFit(widthToFit: number): number {
    return ((this.scrollContainer) && (this.width < widthToFit)) ? this.width * this.zoom / widthToFit: 0;
  }

  adjustForZoom(newZoom: number) {
    if (this.scrollContainer) {
      const leftOfViewPortMid = this.scrollPosition + this.getOffset() - SETTINGS.horizontalPadding;
      const newLeftValue = leftOfViewPortMid * (newZoom / this.zoom);
      this.scrollContainer.scrollTo(newLeftValue - this.getOffset() + SETTINGS.horizontalPadding);
    }

    this.zoom = newZoom;
  }
}

const instance = new ZoomHandler();

export default instance;
