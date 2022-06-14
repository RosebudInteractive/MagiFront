import { SortDirection } from '#src/constants/common';
export declare type Params = {
    lessonId?: string;
    order?: {
        field: string;
        direction: SortDirection;
    };
    pathname?: string;
};
export declare const parseParams: () => Params;
//# sourceMappingURL=tools.d.ts.map