import {Checkbox} from "rsuite";
import React from "react";

export default function CheckBoxField(props) {

    const onChange = (value, checked, event) => {
        props.onChange({field: props.name, value: checked})
    };

    return <div className="filter-row__field-wrapper">
        <Checkbox className={'checkbox-field'}
                  onChange={onChange}
                  checked={props.value ? props.value : false}>{props.placeholder}</Checkbox>
    </div>
}
