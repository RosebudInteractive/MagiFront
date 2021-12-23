import {Checkbox} from "rsuite";
import React from "react";

export default function UserField(props) {

    const _onCheckboxChange = (value, checked,) => {
        props.onChange({field: props.name, value: {...props.value, hasNoExecutor: checked}})
    }

    const _onClean = () => {
        if (props.onClean) props.onClean(props.name)
    }

    const _onTextChange = (e) => {
        props.onChange({field: props.name, value: {...props.value, userName: e.currentTarget.value}})
    }

    const _isNotEmptyValue = props.value.hasNoExecutor || props.value.userName.length

    return <div className="filter-row__field-wrapper">
        <input className="filter-row__field-input _text" type="text"
               placeholder={props.placeholder}
               onChange={_onTextChange}
               value={props.value.userName}
               disabled={props.value.hasNoExecutor}/>
        <Checkbox onChange={_onCheckboxChange} checked={props.value.hasNoExecutor}>Не назначен</Checkbox>
        {_isNotEmptyValue ? <button className="field-input__clear-button" onClick={_onClean}/> : null}
    </div>
}
