import React, {useEffect, useMemo, useState,} from 'react';
import {TextBox} from "../../../../ui-kit";

type Props = {
    value: string,
    onApply: Function,
    onClose: Function,
}

export default function ConditionEditor(props: Props) {
    const {value, onApply, onClose} = props;
    const [myValue, setMyValue] = useState(value)

    useEffect(() => {setMyValue(value)}, [value])

    const changeValue = (e) => {
        setMyValue(e.currentTarget.value)
    }

    const buttonClass = useMemo(() => {
        return (myValue !== value ? 'orange-button' : 'grey-button') + ' small-button'
    }, [value, myValue])

    const apply = () => {
        if (onApply && (myValue !== value)) {
            onApply(myValue)
        }
    }

    return <div className='condition-editor'>
        <button className='close-button' onClick={onClose}/>
        <TextBox value={myValue} label={'Условие'} multiline={true} onChange={changeValue} extClass='condition-value'/>
        <button className={buttonClass} onClick={apply}>Сохранить</button>
    </div>
}
