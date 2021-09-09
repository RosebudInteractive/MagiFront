export const FILTER_FIELD_TYPE = {
    TEXT: "text",
    COMBO: "combo",
    SELECT: "select",
    AUTOCOMPLETE: "autocomplete",
    DATE_RANGE: "date-range",
    USER: "user"
}


export type UserFilterFieldValue = {
    userName: string,
    hasNoExecutor: boolean
}

export type FilterField = {
    name: string,
    placeholder: ?string,
    type: string,
    options: ?Array<FilterFieldOptions>,
    value: ?string | Array<number> | UserFilterFieldValue
}

export type FilterFieldOptions = {
    value: number,
    label: string
}

export type ChangeFieldEvent = {
    field: string,
    value: string | Array<number> | UserFilterFieldValue
}
