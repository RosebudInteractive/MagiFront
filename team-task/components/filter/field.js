import React from "react"
import type {ChangeFieldEvent, FilterField} from "./types";
import {FILTER_FIELD_TYPE} from "./types";
import {Checkbox, CheckPicker, SelectPicker} from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css'

type FieldProps = {
    ...FilterField,
    basis: number,
    onChange: (ChangeFieldEvent) => void,
    onClean: ?Function
}

export default function Field(props: FieldProps) {

    const css = {
        flexBasis: `${props.basis}%`,
        maxWidth: `${props.basis}%`,
    }

    const _getFieldControl = () => {
        switch (props.type) {
            case FILTER_FIELD_TYPE.TEXT:
                return <TextField {...props}/>

            case FILTER_FIELD_TYPE.COMBO:
                return <ComboField {...props}/>

            case FILTER_FIELD_TYPE.SELECT:
                return <SelectField {...props}/>

            case FILTER_FIELD_TYPE.USER:
                return <UserField {...props}/>

            default:
                return null

        }
    }

    return <div className="filter-row__field" style={css}>
        {_getFieldControl()}
    </div>
}


function TextField(props) {
    const _onChange = (e) => {
        props.onChange({field: props.name, value: e.currentTarget.value})
    }

    const _onClean = () => {
        if (props.onClean) props.onClean(props.name)
    }

    return <div className="filter-row__field-wrapper">
        <input className="filter-row__field-input _text" type="text" placeholder={props.placeholder}
               onChange={_onChange} value={props.value}/>
        { props.value && <button className="field-input__clear-button" onClick={_onClean}/> }
    </div>
}

function ComboField(props) {
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

function SelectField(props) {
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

function UserField(props) {

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
        { _isNotEmptyValue ? <button className="field-input__clear-button" onClick={_onClean}/> : null}
    </div>
}


// function UserField(props) {
//
//     const _onCheckboxChange = (value, checked,) => {
//         props.onChange({field: props.name, value: {...props.value, hasNoExecutor: checked}})
//     }
//
//     const _onClean = () => {
//         if (props.onClean) props.onClean(props.name)
//     }
//
//     const _onTextChange = (e) => {
//         props.onChange({field: props.name, value: {...props.value, userName: e.currentTarget.value}})
//     }
//
//     const _isNotEmptyValue = props.value.hasNoExecutor || props.value.userName.length
//
//     return <div className="filter-row__field-wrapper">
//         <input className="filter-row__field-input _text" type="text"
//                placeholder={props.placeholder}
//                onChange={_onTextChange}
//                value={props.value.userName}
//                disabled={props.value.hasNoExecutor}/>
//         <Checkbox onChange={_onCheckboxChange} checked={props.value.hasNoExecutor}>Не назначен</Checkbox>
//         { _isNotEmptyValue ? <button className="field-input__clear-button" onClick={_onClean}/> : null}
//     </div>
// }

// function CheckboxField(props) {
//
//     const _onCheckboxChange = (value, checked) => {
//         props.onChange({field: props.name, value: {...props.value, value: checked}})
//     }
//
//     const _onClean = () => {
//         if (props.onClean) props.onClean(props.name)
//     };
//
//     const _onTextChange = (e) => {
//         props.onChange({field: props.name, value: {...props.value, userName: e.currentTarget.value}})
//     };
//
//     const _isNotEmptyValue = props.value.hasNoExecutor || props.value.userName.length
//
//     return <div className="filter-row__field-wrapper">
//         <input className="filter-row__field-input _text" type="text"
//                placeholder={props.placeholder}
//                onChange={_onTextChange}
//                value={props.value.userName}
//                disabled={props.value.hasNoExecutor}/>
//         <Checkbox onChange={_onCheckboxChange} checked={props.value.hasNoExecutor}>{props.}</Checkbox>
//         { _isNotEmptyValue ? <button className="field-input__clear-button" onClick={_onClean}/> : null}
//     </div>
// }
