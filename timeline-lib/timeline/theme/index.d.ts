import { Theme, ThemeController } from '../../types/theme';
declare class Controller implements ThemeController {
    private readonly themesArray;
    private currentIndex;
    constructor();
    get themes(): Theme[];
    get current(): Theme;
    setCurrent(value: number): void;
}
declare const instance: Controller;
export default instance;
