import React, {useState, useRef, useEffect} from "react"
import type {FilterField} from "./types";
import Button from "./button";
import Row from "./row";

type FilterProps = {
    fields: Array<FilterField>,
    onApply: Function,
    onChangeVisibility: Function
}

export default function Filter(props: FilterProps) {
    const {fields} = props

    const [visible, setVisible] = useState(false)
    const filterValueRef = useRef({})

    useEffect(() => {
        fields.forEach((item: FilterField) => {
            filterValueRef.current[item.name] = item.value
        })

    }, [fields])

    const _onFilterClick = () => {
        setVisible(!visible)
        props.onChangeVisibility()
    }

    const _onChange = (data) => { filterValueRef.current[data.field] = data.value }
    const _onClean = (fieldName) => {
        if (filterValueRef.current[fieldName]) {
            delete filterValueRef.current[fieldName]
            props.onApply(filterValueRef.current)
        }
    }

    const _onApply = () => { props.onApply(filterValueRef.current) }
    const _onClear = () => { props.onApply() }

    return <React.Fragment>
        <Button onClick={_onFilterClick}/>
        <Row fields={fields}
             onChangeField={_onChange}
             onCleanField={_onClean}
             visible={visible}
             onApply={_onApply}
             onClear={_onClear}/>
    </React.Fragment>
}
