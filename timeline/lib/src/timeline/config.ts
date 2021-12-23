export interface IConfigurable {
  title: string;
}

const defaultConfig : IConfigurable = {
  title: 'Ключевые события',
};

class Config implements IConfigurable {
  public title: string;

  constructor(config?: IConfigurable) {
    this.title = (config && config.title) || defaultConfig.title;
  }
}

let instance: Config | null = null;

const getInstance = () => {
  if (!instance) {
    instance = new Config();
  }

  return instance;
};

const applyConfig = (config: IConfigurable) => {
  instance = new Config(config);
};

export { getInstance, applyConfig };
