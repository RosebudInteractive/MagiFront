import React, {useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import './period-form.sass'
import v from "../../../tools/validators";

export default function PeriodForm(props) {
    const {periodData, timelineId, closeModalCb, timelines} = props;
    const [validIs, setValid] = useState(false);

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
        TlCreationId: (timelineId) ? timelineId : null,
    }), [periodData]);

    return (

        (timelines && timelines.length > 0) && <div className="period-form">
            <button type="button" className="modal-form__close-button" onClick={closeModalCb}>Закрыть</button>
            <div className="title">
                <h6>
                    {((periodData && periodData.Id) || periodData.id) ? 'Редактирование' : 'Создание'} периода
                </h6>
            </div>

            <Form
                initialValues={
                    formData
                }
                onSubmit={e => {
                    e.preventDefault();
                }}
                validate={validate}
                subscription={{values: true, pristine: true}}
                render={({periodForm, submitting, pristine, values, valid}) => (
                    <form className='period-form-tag'>
                        <div className='period-form__field'>
                            <div className="period-name">
                                <Field name="Name"
                                       component={TextBox}
                                       label={"Название"}
                                       placeholder="Название"
                                       validate={(periodData && periodData.Id) ? v.required : undefined}
                                       defaultValue={periodData && periodData.Name ? periodData.Name : ''}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>

                        <div className='period-form__field'>
                            <Field name="ShortName"
                                   component={TextBox}
                                   label={"Краткое название"}
                                   placeholder="Краткое название"
                                   initialValue={formData.ShortName}
                                   validate={(periodData && periodData.Id) ? v.required : undefined}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='period-form__field'>
                            <Field name="Description"
                                   component={TextBox}
                                   label={"Описание"}
                                   placeholder="Описание"
                                   validate={(periodData && periodData.Id) ? v.required : undefined}
                                   initialValue={formData.Description}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='period-form__field'>
                            <Field name="TlCreationId"
                                   component={Select}
                                   options={timelines.map((tm) => ({id: tm.Id, label: tm.Name, name: tm.Name}))}
                                   label={"Привязка к таймлайну"}
                                   placeholder="Привязка к таймлайну"
                                   initialValue={timelineId}
                                   validate={(periodData && periodData.Id) ? v.required : undefined}
                                   disabled={!timelineId}>
                            </Field>
                        </div>


                        <div className="period-start-date">
                            <div className='period-form__field start-date'>
                                <Field name="StartDay"
                                       component={TextBox}
                                       label={"Дата начала"}
                                       placeholder="Дата начала"
                                       type={'number'}
                                       initialValue={formData.StartDay}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field'>
                                <Field name="StartMonth"
                                       component={TextBox}
                                       label={"Месяц начала"}
                                       placeholder="Месяц начала"
                                       validate={(periodData && periodData.Id) ?
                                           v.compose(
                                               v.required,
                                               v.positiveInteger,
                                               v.min.bind(v.min, 1),
                                               v.minLength.bind(v.minLength, 1),
                                               v.max.bind(v.max, 31),
                                               v.maxLength.bind(v.maxLength, 2)) : undefined}
                                       type={'number'}
                                       initialValue={formData.StartMonth}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field'>
                                <Field name="StartYear"
                                       component={TextBox}
                                       label={"Год начала"}
                                       placeholder="Год начала"
                                       validate={(periodData && periodData.Id) ?
                                           v.compose(
                                               v.required,
                                               v.minLength.bind(v.minLength, 1),
                                               v.maxLength.bind(v.maxLength, 4)) : undefined}
                                       type={'number'}
                                       initialValue={formData.StartYear}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>

                        <div className="period-end-date">
                            {/*<div className='period-form__field end-date'>*/}
                                <Field name="EndDay"
                                       component={TextBox}
                                       label={"Дата окончания"}
                                       validate={(periodData && periodData.Id) ?
                                           v.compose(
                                               v.required,
                                               v.positiveInteger,
                                               v.min.bind(v.min, 1),
                                               v.minLength.bind(v.minLength, 1),
                                               v.max(31),
                                               v.maxLength(2)) : undefined}
                                       type={'number'}
                                       placeholder="Дата окончания"
                                       initialValue={formData.EndDay}
                                       disabled={false}
                                        extClass="period-form__field end-date"/>
                                {/*</Field>*/}
                            {/*</div>*/}

                            {/*<div className='period-form__field end-date'>*/}
                                <Field name="EndMonth"
                                       component={TextBox}
                                       label={"Месяц окончания"}
                                       validate={(periodData && periodData.Id) ?
                                           v.compose(
                                               v.required,
                                               v.positiveInteger,
                                               v.min.bind(v.min, 1),
                                               v.minLength.bind(v.minLength, 1),
                                               v.max.bind(v.max, 31),
                                               v.maxLength.bind(v.maxLength, 2)) : undefined}
                                       type={'number'}
                                       placeholder="Месяц окончания"
                                       initialValue={formData.EndMonth}
                                       disabled={false}
                                extClass="period-form__field end-date"/>
                                {/*</Field>*/}
                            {/*</div>*/}

                            {/*<div className='period-form__field end-date'>*/}
                                <Field name="EndYear"
                                       component={TextBox}
                                       label={"Год окончания"}
                                       validate={(periodData && periodData.Id) ?
                                           v.compose(
                                               v.required,
                                               v.minLength.bind(v.minLength, 1),
                                               v.maxLength.bind(v.maxLength, 4)) : undefined}
                                       type={'number'}
                                       placeholder="Год окончания"
                                       initialValue={formData.EndYear}
                                       disabled={false}
                                extClass="period-form__field end-date"/>
                                {/*</Field>*/}
                            {/*</div>*/}
                        </div>


                        <div className='period-form__field center'>
                            <button type={'button'} className="orange-button big-button" disabled={!validIs}
                                    onClick={() => props.onSave({
                                        id: periodData.Id,
                                        tableId: periodData.id,
                                        values: values
                                    })}>Сохранить
                            </button>
                        </div>


                        <FormSpy subscription={{values: true, pristine: true}}
                                 onChange={({values, pristine, formValue, valid}) => {
                                     console.log('onChange');
                                     console.log('valid', valid);
                                     console.log('formValue', formValue);
                                     if ((periodData && periodData.Id)) {
                                         setValid(true); //cause pristine todo change dis to normal validation
                                     } else {
                                         if (periodData) {
                                             if ((values.Name && values.Name.length > 0) &&
                                                 (values.ShortName && values.ShortName.length > 0) &&
                                                 (values.Description && values.Description.length > 0) &&
                                                 (values.StartDay) &&
                                                 (values.EndDay) &&
                                                 (values.EndYear) &&
                                                 (values.EndMonth) &&
                                                 (values.StartMonth) &&
                                                 (values.StartYear)) {
                                                 setValid(true);
                                             }
                                         } //todo do same crazy shit in event form too
                                     }
                                 }}/>
                    </form>
                )}/>
        </div>)
}


const validate = (values) => {
    const errors = {}

    if (!values.StartYear) {
        errors.StartYear = 'Required'
    }

    if (values.StartYear && !values.StartDay && !values.StartMonth) {
        errors.StartMonth = 'Required'
    }

    if ((values.StartMonth > 12) || (values.StartMonth < 1)) {
        errors.StartMonth = 'Wrong value'
    }

    // todo : сделать учет месяцев
    if ((values.StartDay > 31) || (values.StartDay < 1)) {
        errors.StartDay = 'Wrong value'
    }



    return errors
}
