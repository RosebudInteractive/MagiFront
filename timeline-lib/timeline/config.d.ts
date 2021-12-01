export interface IConfigurable {
    title: string;
}
declare class Config implements IConfigurable {
    title: string;
    constructor(config?: IConfigurable);
}
declare const getInstance: () => Config;
declare const applyConfig: (config: IConfigurable) => void;
export { getInstance, applyConfig };
