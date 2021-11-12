import React, {useMemo} from "react"
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
    onClean?: Function,
    disableDefaultWidthBasis: boolean
}

export default function Field(props: FieldProps) {

    const { disableDefaultWidthBasis, basis } = props;

    const wrapperStyle = useMemo(() => {
        return disableDefaultWidthBasis
            ? {}
            : {
                flexBasis: `${basis}%`,
                maxWidth: `${basis}%`,
            }
        },
        [basis, disableDefaultWidthBasis]);

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

    return <div className="filter-row__field" style={wrapperStyle}>
        {getFieldControl()}
    </div>
}
