import {CheckPicker} from "rsuite";
import React, {useEffect} from "react";

export default function ComboFilterField(props) {


    useEffect(()=>{
        console.log('newSelect value:', value)
    },[props.value]);

    const _onClean = () => {
        if (props.onClean) props.onClean(props.name)
    }

    const _onChange = (value) => {
        props.onChange({field: props.name, value})
    };

    return <CheckPicker className="filter-row__field-input _select"
                        data={props.options}
                        placeholder={props.placeholder}
                        searchable={false}
                        value={props.value}
                        defaultValue={props.defaultValue}
                        onSelect={_onChange}
                        onClean={_onClean}/>
}
