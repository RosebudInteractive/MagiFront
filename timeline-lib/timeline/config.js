const defaultConfig = {
    title: 'Ключевые события',
};
class Config {
    title;
    constructor(config) {
        this.title = (config && config.title) || defaultConfig.title;
    }
}
let instance = null;
const getInstance = () => {
    if (!instance) {
        instance = new Config();
    }
    return instance;
};
const applyConfig = (config) => {
    instance = new Config(config);
};
export { getInstance, applyConfig };
