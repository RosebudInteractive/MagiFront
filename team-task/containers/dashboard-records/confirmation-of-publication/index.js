import React, {useEffect, useMemo, useState} from "react";
import {DatePicker} from "../../../components/ui-kit";
import "./confirmation-of-publication.sass"
import $ from "jquery";

function ConfirmationOfPublication(props) {
    const { DateObject, closeAction } = props;

    const [value, setValue] = useState(null)

    const onApply = () => {}
    const onCancel = () => { if (closeAction) closeAction() }

    useEffect(() => {
        setValue(DateObject.toDate())

        $("body").addClass("_no-vertical-scroll")

        return () => {
            $("body").removeClass("_no-vertical-scroll")
        }
    }, [])

    const disableApply = useMemo(() => {
        return !value || DateObject.isSame(value)
    }, [DateObject, value])

    const onChange = (date) => {
        setValue(date)
    }

    return (
        <div className="confirmation-of-publication">
            <div className='publication-title'>
                <div className='publication-title__course _single-line'>
                    {props.CourseName}
                </div>
                <div className='publication-title__lesson _single-line'>
                    {props.LessonName}
                </div>
            </div>
            <DatePicker value={value}
                        label={'Дата публикации'}
                        onChange={onChange}/>
            <div className="action-buttons">
                <button type={"button"} onClick={onApply} className={'orange-button big-button _apply'}
                        disabled={disableApply}>Сохранить
                </button>
                <button type={"button"} onClick={onCancel} className={'grey-button big-button _cancel'}>Отмена</button>
            </div>
        </div>
    )
}

export default ConfirmationOfPublication;
