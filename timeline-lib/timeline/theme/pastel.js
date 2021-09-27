import { Theme } from '../../types/theme';
class Pastel extends Theme {
    constructor() {
        super();
        this.title = 'Пастель';
        this.font = {
            family: 'Fira Sans',
            color: '#000000',
            // weight: 'bold',
        };
        this.enableAlpha = false;
        this.palette = [
            '#d6d7cd',
            '#d3bc9c',
            '#f3d6ba',
            '#ecc3a6',
            '#e4b091',
            '#ea9571',
            '#f6997c',
            '#c4a191',
            '#91a9a6',
            '#9bb1ae',
        ];
    }
}
export default new Pastel();
