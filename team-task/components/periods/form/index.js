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
        StartDay: periodData.StartDay,
        StartMonth: periodData.StartMonth,
        StartYear: periodData.StartYear,
        EndDay: periodData.EndDay,
        EndMonth: periodData.EndMonth,
        EndYear: periodData.EndYear,
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
                            <Field name="StartDay"
                                   component={TextBox}
                                   label={"Дата начала"}
                                   placeholder="Дата начала"
                                   type={'number'}
                                   initialValue={formData.StartDay}
                                   disabled={false}
                                   extClass={'period-form__field'}>
                            </Field>

                            <Field name="StartMonth"
                                   component={TextBox}
                                   label={"Месяц начала"}
                                   placeholder="Месяц начала"
                                   type={'number'}
                                   initialValue={formData.StartMonth}
                                   disabled={false}
                                   extClass={'period-form__field'}>
                            </Field>

                            <Field name="StartYear"
                                   component={TextBox}
                                   label={"Год начала"}
                                   placeholder="Год начала"
                                   initialValue={formData.StartYear}
                                   disabled={false}
                                   extClass={'period-form__field'}>
                            </Field>
                        </div>

                        <div className="period-end-date">
                            <Field name="EndDay"
                                   component={TextBox}
                                   label={"Дата окончания"}
                                   type={'number'}
                                   placeholder="Дата окончания"
                                   initialValue={formData.EndDay}
                                   disabled={false}
                                   extClass="period-form__field end-date"/>
                            <Field name="EndMonth"
                                   component={TextBox}
                                   label={"Месяц окончания"}
                                   type={'number'}
                                   placeholder="Месяц окончания"
                                   initialValue={formData.EndMonth}
                                   disabled={false}
                                   extClass="period-form__field end-date"/>

                            <Field name="EndYear"
                                   component={TextBox}
                                   label={"Год окончания"}
                                   placeholder="Год окончания"
                                   initialValue={formData.EndYear}
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

    vals.StartYear = parseInt(vals.StartYear);
    vals.StartMonth = parseInt(vals.StartMonth);
    vals.StartDay = parseInt(vals.StartDay);
    vals.EndYear = parseInt(vals.EndYear);
    vals.EndMonth = parseInt(vals.EndMonth);
    vals.EndDay = parseInt(vals.EndDay);

    const errors = {};

    if (!vals.StartYear) {
        errors.StartYear = 'Обязательное поле'
    }

    if (vals.StartYear && vals.StartDay && !vals.StartMonth) {
        errors.StartMonth = 'Обязательное поле'
    }

    if (vals.StartMonth && (vals.StartMonth > 12 || vals.StartMonth < 1)) {
        errors.StartMonth = 'Неправильное значение'
    }

    if (!vals.EndYear) {
        errors.EndYear = 'Обязательное поле'
    }

    if (vals.EndYear && vals.EndDay && !vals.EndMonth) {
        errors.EndMonth = 'Обязательное поле'
    }

    if (vals.EndMonth &&(vals.EndMonth > 12) || (vals.EndMonth < 1)) {
        errors.EndMonth = 'Неправильное значение'
    }

    if (vals.StartDay && (vals.StartDay > 31) || (vals.StartDay < 1)) {
        errors.StartDay = 'Неправильное значение'
    }

    if (vals.EndDay && (vals.EndDay > 31) || (vals.EndDay < 1)) {
        errors.EndDay = 'Неправильное значение'
    }

    if (!vals.Name || (vals.Name && vals.Name.length < 1)){
        errors.Name = 'Обязательное поле'
    }

    if (!vals.ShortName || (vals.ShortName && vals.ShortName.length < 1)) {
        errors.ShortName = 'Обязательное поле'
    }

    if (vals.StartDay && vals.StartYear && vals.StartMonth) {
        const dateObj = moment({
                year: vals.StartYear,
                month: parseInt(vals.StartMonth - 1),
                day: vals.StartDay
            }
        );
        if (!dateObj.isValid()) {
            errors.StartDay = 'Неправильная дата';
        }
    }

    if (vals.EndYear && vals.EndMonth && vals.EndDay) {
        const dateObj = moment({
                year: vals.EndYear,
                month: parseInt(vals.EndMonth - 1),
                day: vals.EndDay
            }
        );
        if (!dateObj.isValid()) {
            errors.EndDay = 'Неправильная дата';
        }
    }

    disableValidationOnFields.map(field => {
        field.condition && delete errors[field.fieldName];
    });

    return errors
};
