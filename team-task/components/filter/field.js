import React from "react"
import type {ChangeFieldEvent, FilterField} from "./types";
import {FILTER_FIELD_TYPE} from "./types";
import {
    AutocompleteField,
    CheckBoxField,
    ComboField,
    DateRangeField,
    SelectField,
    TextField,
    UserField
} from './fields';
import 'rsuite/dist/styles/rsuite-default.css'

type FieldProps = {
    ...FilterField,
    basis: number,
    onChange: (ChangeFieldEvent) => void,
    onClean: ?Function,
    disableDefaultWidthBasis?: boolean,
    customClassOrCss?: string | Object
}

export default function Field(props: FieldProps) {

    const css = {
        flexBasis: `${props.basis}%`,
        maxWidth: `${props.basis}%`,
        ...(props.customClassOrCss ? props.customClassOrCss : {})
    };

    const getFieldControl = () => {
        switch (props.type) {
            case FILTER_FIELD_TYPE.TEXT:
                return <TextField {...props}/>

            case FILTER_FIELD_TYPE.COMBO:
                return <ComboField {...props}/>

            case FILTER_FIELD_TYPE.SELECT:
                return <SelectField {...props}/>

            case FILTER_FIELD_TYPE.AUTOCOMPLETE:
                return <AutocompleteField {...props}/>

            case FILTER_FIELD_TYPE.DATE_RANGE:
                return <DateRangeField {...props}/>

            case FILTER_FIELD_TYPE.USER:
                return <UserField {...props}/>

            case FILTER_FIELD_TYPE.CHECKBOX:
                return <CheckBoxField {...props}/>

            default:
                return null
        }
    }

    return <div className="filter-row__field" style={props.disableDefaultWidthBasis ? {} : css}>
        {getFieldControl()}
    </div>
}
