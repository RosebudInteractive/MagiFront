export declare const FILTER_FIELD_TYPE: {
    TEXT: string;
    COMBO: string;
    SELECT: string;
    AUTOCOMPLETE: string;
    DATE_RANGE: string;
    USER: string;
};
export declare type FilterValue = {
    [key: string]: number | string | number[] | null | boolean;
};
export declare type UserFilterFieldValue = {
    userName: string;
    hasNoExecutor: boolean;
};
export declare type FilterField = {
    name: string;
    placeholder?: string;
    type: string;
    options?: Array<FilterFieldOptions>;
    value?: string | number | any[] | null | UserFilterFieldValue | boolean;
};
export declare type FilterFieldOptions = {
    value: number;
    label: string;
};
export declare type ChangeFieldEvent = {
    field: string;
    value: string | Array<number> | UserFilterFieldValue;
};
declare type SelectOption = {
    id: string;
    name: string;
};
export declare type SelectOptions = Array<SelectOption>;
export {};
//# sourceMappingURL=common.d.ts.map