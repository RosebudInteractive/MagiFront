import React, {useEffect, useMemo, useRef, useState} from "react"
import type {FilterField} from "./types";
import "./filter.sass"
import Button from "./button";
import Row from "./row";

type FilterProps = {
    fields: Array<FilterField>,
    onApply: Function,
    onChangeField?: Function,
    onChangeVisibility: Function,
    disableDefaultWidthBasis?: boolean
}

export default function Filter(props: FilterProps) {
    const { fields, onChangeField, disableDefaultWidthBasis } = props;

    const [visible, setVisible] = useState(false)
    const [activeSwitcher, toggleActive] = useState(false)
    const filterValueRef = useRef({});


    useEffect(() => {
        fields.forEach((item: FilterField) => {
            filterValueRef.current[item.name] = item.value
        })

    }, [fields]);

    const _onFilterClick = () => {
        setVisible(!visible)
        props.onChangeVisibility()
    };

    const _onChange = (data) => {
        filterValueRef.current[data.field] = data.value
        toggleActive(!activeSwitcher)

        if(onChangeField){
            onChangeField({name: data.field, value: data.value})
        }
    };


    const _onClean = (fieldName) => {
        if (filterValueRef.current[fieldName]) {
            delete filterValueRef.current[fieldName]
            props.onApply(filterValueRef.current)
        }
        toggleActive(!activeSwitcher)
    }

    const _onApply = () => { props.onApply(filterValueRef.current) }
    const _onClear = () => { props.onApply() }

    const _isActiveFilter = useMemo(() => {
        return fields && fields.some(field => !!field.value )
    }, [fields])

    return <React.Fragment>
        <Button onClick={_onFilterClick} opened={visible} active={_isActiveFilter}/>
        <Row fields={fields}
             onChangeField={_onChange}
             onCleanField={_onClean}
             visible={visible}
             disableDefaultWidthBasis={!!disableDefaultWidthBasis}
             onApply={_onApply}
             onClear={_onClear}/>
    </React.Fragment>
}
