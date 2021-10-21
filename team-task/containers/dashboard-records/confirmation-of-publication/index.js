import React, {useEffect, useMemo, useState} from "react";
import {DatePicker} from "../../../components/ui-kit";
import "./confirmation-of-publication.sass"
import $ from "jquery";
import moment from "moment";

function ConfirmationOfPublication(props) {
    const {record, closeAction} = props;

    const [value, setValue] = useState(null);

    const onApply = () => {
        const val = moment(value);
        props.applyAction(
            {...record,
                PubDate: val.locale('ru').format('DD MMM'),
                DateObject: val,
            });

        if (closeAction) closeAction();
    };

    const onCancel = () => {
        if (closeAction) closeAction()
    };

    useEffect(() => {
        setValue(record.DateObject.toDate())

        $("body").addClass("_no-vertical-scroll")

        return () => {
            $("body").removeClass("_no-vertical-scroll")
        }
    }, []);

    const dateShouldDisable = function (date) {
        return (moment(date).isBefore(moment()) && !moment(record.DateObject).isSame(date, 'day'));
    };

    const disableApply = useMemo(() => {
        return !value || record.DateObject.isSame(value)
    }, [record.DateObject, value]);

    const onChange = (date) => {
        setValue(date)
    }

    return (
        <div className="confirmation-of-publication">
            <div className='publication-title'>
                <div className='publication-title__course _single-line'>
                    {record.CourseName}
                </div>
                <div className='publication-title__lesson _single-line'>
                    {record.LessonName}
                </div>
            </div>
            <DatePicker value={value}
                        label={'Дата публикации'}
                        onChange={onChange}
                        error={false}
                        helperText={null}
                        shouldDisableDate={dateShouldDisable}
                        isoWeek

            />
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
