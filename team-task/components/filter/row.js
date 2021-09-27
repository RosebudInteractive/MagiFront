import React, {useEffect, useState,} from "react"
import type {ChangeFieldEvent, FilterField} from "./types";
import {FILTER_FIELD_TYPE} from "./types";
import Field from "./field";
import ClearIcon from "tt-assets/svg/close.svg"


type RowProps = {
    fields: Array<FilterField>,
    onApply: Function,
    onClear: Function,
    onChangeField: (ChangeFieldEvent) => void,
    onCleanField: Function,
    visible: boolean
}

export default function Row(props: RowProps) {
    const {fields, visible} = props

    const [extFields, setExtFields] = useState([])
    const [forceUpdate, setForceUpdate] = useState(false)

    useEffect(() => {
        setExtFields(fields.map((item) => {
            let _object = {...item}
            if (item.options !== undefined) { _object.options = [...item.options] }
            _object.value = item.value ? item.value : getEmptyFieldValue(item)

            return _object
        }))
    }, [fields])

    const _basis = fields.length ? Math.round(100 / fields.length) : 100

    const _clear = () => {
        const _fields = extFields.map((item) => {
            item.value = getEmptyFieldValue(item)
            return item
        })

        setExtFields(_fields)
        props.onClear()
    }

    const onFieldChange = (e: ChangeFieldEvent) => {
        let _field = extFields.find(item => item.name === e.field)
        if (_field) {
            _field.value = e.value
            setExtFields(extFields)
            setForceUpdate(!forceUpdate)
            props.onChangeField(e)
        }
    }

    return <div className={"filter-block" + (visible ? " _visible" : "")}>
        <div className="filter-row">
            {
                extFields.map((item, index) => {
                    return <Field {...item} key={index} basis={_basis} onChange={onFieldChange}
                                  onClean={props.onCleanField}/>
                })
            }
        </div>
        <div className="filter-block__buttons">
            <div className="filter-block__clear-button" onClick={_clear}>
                <ClearIcon/>
                <span className="_title">Сбросить</span>
            </div>
            <div className="filter-block__apply-button orange-button big-button" onClick={props.onApply}>Показать</div>
        </div>

    </div>
}

const getEmptyFieldValue = (field: FilterField) => {
    switch (field.type) {
        case FILTER_FIELD_TYPE.TEXT:
            return ""
        case FILTER_FIELD_TYPE.COMBO:
            return []
        case FILTER_FIELD_TYPE.USER:
            return {userName: "", hasNoExecutor: false}
        case FILTER_FIELD_TYPE.AUTOCOMPLETE:
            return ''
        case FILTER_FIELD_TYPE.DATE_RANGE:
            return null;
        default:
            return null
    }
}
