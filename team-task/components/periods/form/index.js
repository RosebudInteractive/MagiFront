import React, {useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {TextBox} from "../../ui-kit";
import './period-form.sass'
import {TIMELINE_STATE} from "../../../constants/states";
import moment from "moment";

export default function PeriodForm(props) {
    const {periodData, timelineId, closeModalCb, timelines} = props;
    const [validIs, setValid] = useState(false);
    const [formPristine, setFormPristine] = useState(true);

    const _state = useMemo(() => {
        const result = Object.values(TIMELINE_STATE).find(item => item.value === periodData.State);
        return result ? result : {label: "Ошибка", css: "_error"}
    }, [periodData.State]);

    const formData = useMemo(() => ({
        Name: periodData.Name,
        ShortName: periodData.ShortName,
        Description: periodData.Description,
        LbDay: periodData.LbDay,
        LbMonth: periodData.LbMonth,
        LbYear: periodData.LbYear,
        RbDay: periodData.RbDay,
        RbMonth: periodData.RbMonth,
        RbYear: periodData.RbYear,
    }), [periodData]);

    return <div className="period-form">
            <button type="button" className="modal-form__close-button" onClick={() => closeModalCb(!formPristine)}>Закрыть</button>
            <div className="title">
                <h6>
                    {((periodData && periodData.Id) || periodData.id) ? 'Редактирование' : 'Создание'} периода
                </h6>

                <div className={"header__timeline-state font-body-s " + _state.css}>{_state.label}</div>
            </div>

            <Form
                initialValues={formData}
                onSubmit={e => {e.preventDefault()}}
                validate={values => validate(values, [
                        {fieldName: 'TlCreationId', condition: !periodData.Id}])
                }
                subscription={{values: true, pristine: true}}
                render={({periodForm, form, submitting, pristine, values, valid, errors, touched}) => (
                    <form className='period-form-tag'>
                        <div className='period-form__field'>
                            <div className="period-name">
                                <Field name="Name"
                                       component={TextBox}
                                       label={"Название"}
                                       placeholder="Название"
                                       defaultValue={periodData && periodData.Name ? periodData.Name : ''}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>

                        <Field name="ShortName"
                               component={TextBox}
                               label={"Краткое название"}
                               placeholder="Краткое название"
                               initialValue={formData.ShortName}
                               disabled={false}
                               extClass={'period-form__field'}>
                        </Field>

                        <Field name="Description"
                               component={TextBox}
                               label={"Описание"}
                               placeholder="Описание"
                               initialValue={formData.Description}
                               disabled={false}
                               extClass={'period-form__field'}>
                        </Field>

                        <div className="period-start-date">
                            <Field name="LbDay"
                                   component={TextBox}
                                   label={"Дата начала"}
                                   placeholder="Дата начала"
                                   type={'number'}
                                   initialValue={formData.LbDay}
                                   disabled={false}
                                   extClass={'period-form__field'}>
                            </Field>

                            <Field name="LbMonth"
                                   component={TextBox}
                                   label={"Месяц начала"}
                                   placeholder="Месяц начала"
                                   type={'number'}
                                   initialValue={formData.LbMonth}
                                   disabled={false}
                                   extClass={'period-form__field'}>
                            </Field>

                            <Field name="LbYear"
                                   component={TextBox}
                                   label={"Год начала"}
                                   placeholder="Год начала"
                                   initialValue={formData.LbYear}
                                   disabled={false}
                                   extClass={'period-form__field'}>
                            </Field>
                        </div>

                        <div className="period-end-date">
                            <Field name="RbDay"
                                   component={TextBox}
                                   label={"Дата окончания"}
                                   type={'number'}
                                   placeholder="Дата окончания"
                                   initialValue={formData.RbDay}
                                   disabled={false}
                                   extClass="period-form__field end-date"/>
                            <Field name="RbMonth"
                                   component={TextBox}
                                   label={"Месяц окончания"}
                                   type={'number'}
                                   placeholder="Месяц окончания"
                                   initialValue={formData.RbMonth}
                                   disabled={false}
                                   extClass="period-form__field end-date"/>

                            <Field name="RbYear"
                                   component={TextBox}
                                   label={"Год окончания"}
                                   placeholder="Год окончания"
                                   initialValue={formData.RbYear}
                                   disabled={false}
                                   extClass="period-form__field end-date"/>
                        </div>


                        <div className='period-form__field center'>
                            <button type={'button'} className="orange-button big-button" disabled={((validIs) && !formPristine) !== true}
                                    onClick={() => props.onSave({
                                        id: periodData.Id,
                                        tableId: periodData.id,
                                        values: values
                                    })}>Сохранить
                            </button>
                        </div>

                        <FormSpy subscription={{values: true, pristine: true, errors: true, submitting, touched: true}}
                                 onChange={({values, pristine, errors, submitting, touched}) => {
                                     setFormPristine(pristine);
                                     setValid(Object.values(errors).length === 0);
                                 }}/>
                    </form>
                )}/>
        </div>
}


const validate = (values, disableValidationOnFields = []) => {
    const vals = values;

    vals.LbYear = parseInt(vals.LbYear);
    vals.LbMonth = parseInt(vals.LbMonth);
    vals.LbDay = parseInt(vals.LbDay);
    vals.RbYear = parseInt(vals.RbYear);
    vals.RbMonth = parseInt(vals.RbMonth);
    vals.RbDay = parseInt(vals.RbDay);

    const errors = {};

    if (vals.LbYear && vals.LbDay && !vals.LbMonth) {
        errors.LbMonth = 'Обязательное поле'
    }

    if (vals.LbMonth && (vals.LbMonth > 12 || vals.LbMonth < 1)) {
        errors.LbMonth = 'Неправильное значение'
    }

    if ((!vals.RbYear && !vals.LbYear)) {
        errors.RbYear = 'Обязательное поле';
        errors.LbYear = 'Обязательное поле';
    }

    if (vals.RbYear && vals.RbDay && !vals.RbMonth) {
        errors.RbMonth = 'Обязательное поле'
    }

    if (vals.RbMonth &&(vals.RbMonth > 12) || (vals.RbMonth < 1)) {
        errors.RbMonth = 'Неправильное значение'
    }

    if (vals.LbDay && (vals.LbDay > 31) || (vals.LbDay < 1)) {
        errors.LbDay = 'Неправильное значение'
    }

    if (vals.RbDay && (vals.RbDay > 31) || (vals.RbDay < 1)) {
        errors.RbDay = 'Неправильное значение'
    }

    if (!vals.Name || (vals.Name && vals.Name.length < 1)){
        errors.Name = 'Обязательное поле'
    }

    // if (!vals.ShortName || (vals.ShortName && vals.ShortName.length < 1)) {
    //     errors.ShortName = 'Обязательное поле'
    // }

    if (vals.LbDay && vals.LbYear && vals.LbMonth) {
        const dateObj = moment({
                year: vals.LbYear,
                month: parseInt(vals.LbMonth - 1),
                day: vals.LbDay
            }
        );
        if (!dateObj.isValid()) {
            errors.LbDay = 'Неправильная дата';
        }
    }

    if (vals.RbYear && vals.RbMonth && vals.RbDay) {
        const dateObj = moment({
                year: vals.RbYear,
                month: parseInt(vals.RbMonth - 1),
                day: vals.RbDay
            }
        );
        if (!dateObj.isValid()) {
            errors.RbDay = 'Неправильная дата';
        }
    }

    if(vals.LbYear && vals.RbYear && (vals.LbYear >= vals.RbYear) && !(vals.RbMonth && vals.LbMonth) && !(vals.LbDay && vals.RbDay)){
        errors.LbYear = "Неправильный интервал дат";
        errors.RbYear = "Неправильный интервал дат";
    }

    if(vals.LbYear && vals.RbYear && (vals.LbMonth && vals.RbMonth) && (vals.LbMonth >= vals.RbMonth) && (vals.LbYear <= vals.RbYear) && !(vals.LbDay && vals.RbDay)){
        errors.LbMonth = "Неправильный интервал дат";
        errors.RbMonth = "Неправильный интервал дат";
    }

    if((vals.LbYear && vals.RbYear) && ((!vals.LbMonth || !vals.RbMonth)) && (vals.LbYear === vals.RbYear) && !(vals.LbDay && vals.RbDay)){
        errors.LbMonth = "Неправильный интервал дат";
        errors.RbMonth = "Неправильный интервал дат";
    }

    if((vals.LbYear && vals.RbYear) && (vals.LbMonth && vals.RbMonth) && (vals.LbYear === vals.RbYear)  && (vals.LbMonth === vals.RbMonth) && !(vals.LbDay || vals.RbDay)){
        errors.LbDay = "Неправильный интервал дат";
        errors.RbDay = "Неправильный интервал дат";
    }

    if((vals.LbYear && vals.RbYear) && (vals.LbMonth && vals.RbMonth) && (vals.LbYear === vals.RbYear) &&
        (vals.LbDay && vals.RbDay) && (vals.LbMonth >= vals.RbMonth) && (vals.LbDay >= vals.RbDay)){
        errors.LbDay = "Неправильный интервал дат";
        errors.RbDay = "Неправильный интервал дат";
    }

    disableValidationOnFields.map(field => {
        field.condition && delete errors[field.fieldName];
    });

    return errors
};
