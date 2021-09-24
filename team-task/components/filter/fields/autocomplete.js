import {InputPicker} from "rsuite";
import React from "react";

export default function AutocompleteField(props) {
    const _onClean = () => {
        if (props.onClean) props.onClean(props.name)
    };

    const _onChange = (value) => {
        if(props.value !== value) {
            props.onChange({field: props.name, value})
        }
    };

    return <InputPicker className="filter-row__field-input _autocomplete"
                         data={props.options}
                         placeholder={props.placeholder}
                         value={props.value}
                         defaultValue={props.defaultValue}
                         onSelect={_onChange}
                         onClean={_onClean}/>
}
