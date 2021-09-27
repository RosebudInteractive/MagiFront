import { Theme } from '../../types/theme';
class Dark extends Theme {
    constructor() {
        super();
        this.title = 'Тёмная';
        this.font = {
            family: 'Fira Sans',
            size: 11,
            color: '#ffffff',
            // weight: 'bold',
        };
        this.palette = [
            '#8f0c4d',
            '#283349',
            '#e65855',
            '#69140e',
            '#872b07',
            '#a44200',
            '#d58936',
            '#ccc500',
            '#3b5200',
            '#121f37',
        ];
    }
}
export default new Dark();
