import Pastel from './pastel';
import Dark from './dark';
import { Theme, ThemeController } from '../../types/theme';

class Controller implements ThemeController {
  private readonly themesArray: Theme[];

  private currentIndex: number;

  constructor() {
    this.themesArray = [
      Dark,
      Pastel,
    ];

    this.currentIndex = 0;
  }

  get themes() {
    return this.themesArray;
  }

  get current() {
    return this.themesArray[this.currentIndex];
  }

  setCurrent(value: number): void {
    if (value >= this.themesArray.length) return;

    this.currentIndex = value;
  }
}

const instance: Controller = new Controller();

export default instance;
