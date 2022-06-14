import { Dashboard } from '../../../@types/dashboard';
export declare const MAIN_COLUMNS: ({
    id: string;
    hidden: boolean;
    header?: undefined;
    css?: undefined;
    width?: undefined;
    minWidth?: undefined;
    fillspace?: undefined;
} | {
    id: string;
    header: {
        text: string;
        css: string;
    }[];
    css: string;
    hidden?: undefined;
    width?: undefined;
    minWidth?: undefined;
    fillspace?: undefined;
} | {
    id: string;
    css: string;
    header: {
        text: string;
        css: string;
    }[];
    width: number;
    template(val: Dashboard.Record): string;
    hidden?: undefined;
    minWidth?: undefined;
    fillspace?: undefined;
} | {
    id: string;
    header: string;
    minWidth: number;
    css: string;
    fillspace: boolean;
    template(data: Dashboard.Record): string;
    hidden?: undefined;
    width?: undefined;
} | {
    id: string;
    header: {
        text: string;
        css: string;
    }[];
    hidden: boolean;
    css?: undefined;
    width?: undefined;
    minWidth?: undefined;
    fillspace?: undefined;
})[];
export declare const STATE_COLUMNS: ({
    id: string;
    header: {
        text: string;
        css: string;
    }[];
    css: string;
    template(val: Dashboard.Record): string;
    width?: undefined;
} | {
    id: string;
    header: string;
    width: number;
    css: string;
    template(): string;
})[];
//# sourceMappingURL=consts.d.ts.map