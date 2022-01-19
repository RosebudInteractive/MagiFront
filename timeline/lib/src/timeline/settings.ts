class Settings {
  public horizontalPadding: number;

  public message: {
    width: string | number; minWidth: number; maxWidth: number, viewportCheckpoint: number
  };

  public zoom: {
    multiplier: number;
    step: number;
    min: number;
    max: number;
    animation: { longTime: number; shortTime: number }
  };

  public axis: { itemMinWidth: number };

  public period: { emptyWidth: number; minTitleWidth: number };

  public canvas: { minWidth: number };

  constructor() {
    this.axis = {
      itemMinWidth: 50,
    };
    this.horizontalPadding = 40;
    this.message = {
      minWidth: 236,
      maxWidth: 356,
      width: '24%',
      viewportCheckpoint: 2,
    };
    this.zoom = {
      multiplier: 1.35,
      step: 1,
      min: 0,
      max: 20,
      animation: {
        shortTime: 500,
        longTime: 700,
      },
    };

    this.period = {
      emptyWidth: 50,
      minTitleWidth: 150,
    };

    this.canvas = {
      minWidth: 4000,
    };
  }

  isVerticalViewport(width: number) {
    return width ? width < this.message.minWidth * this.message.viewportCheckpoint : false;
  }
}

const SETTINGS: Settings = new Settings();

export default SETTINGS;
