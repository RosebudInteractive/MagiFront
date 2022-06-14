import { FilterField, FilterValue } from '../../../@types/common';
export declare const getFilterConfig: (filter: FilterValue, courseOptions?: never[]) => FilterField[];
declare type Params = {
    order?: {
        field: string;
        direction: string;
    };
    filter?: any;
    viewMode?: number;
    activeRecord?: number;
};
export declare const parseParams: () => Params;
export declare const convertFilter2Params: (filter: FilterValue) => any;
export declare const resizeHandler: (rowCount: number) => void;
export declare const refreshColumns: (config: any) => void;
export declare const getProcessState: (val: number) => {
    css: string;
    label: string;
};
export {};
//# sourceMappingURL=functions.d.ts.map