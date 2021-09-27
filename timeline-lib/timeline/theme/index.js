import Pastel from './pastel';
import Dark from './dark';
class Controller {
    themesArray;
    currentIndex;
    constructor() {
        this.themesArray = [
            Pastel,
            Dark,
        ];
        this.currentIndex = 0;
    }
    get themes() {
        return this.themesArray;
    }
    get current() {
        return this.themesArray[this.currentIndex];
    }
    setCurrent(value) {
        if (value >= this.themesArray.length)
            return;
        this.currentIndex = value;
    }
}
const instance = new Controller();
export default instance;
