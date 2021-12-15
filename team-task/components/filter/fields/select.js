import {SelectPicker} from "rsuite";
import React from "react";

console.log('DEBUG', SelectPicker)

export default function SelectField(props) {
    const _onClean = () => {
        if (props.onClean) props.onClean(props.name)
    }

    const _onChange = (value) => {
        props.onChange({field: props.name, value})
    };

    return <SelectPicker className="filter-row__field-input _select"
                         data={props.options}
                         placeholder={props.placeholder}
                         searchable={false}
                         value={props.value}
                         defaultValue={props.defaultValue}
                         onSelect={_onChange}
                         onClean={_onClean}/>
}
