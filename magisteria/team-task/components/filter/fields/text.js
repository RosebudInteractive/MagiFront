import React from "react";

export default function TextField(props) {
    const _onChange = (e) => {
        props.onChange({field: props.name, value: e.currentTarget.value})
    }

    const _onClean = () => {
        if (props.onClean) props.onClean(props.name)
    }

    return <div className="filter-row__field-wrapper">
        <input className="filter-row__field-input _text" type="text" placeholder={props.placeholder}
               onChange={_onChange} value={props.value}/>
        {props.value && <button className="field-input__clear-button" onClick={_onClean}/>}
    </div>
}
