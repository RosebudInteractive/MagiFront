import React, {useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import './event-form.sass'

export default function EventForm(props) {
    const {eventData, timelineId, closeModalCb, timelines} = props;
    const [validIs, setValid] = useState(false);

    const formData = useMemo(() => ({
        Name: eventData.Name,
        ShortName: eventData.ShortName,
        Description: eventData.Description,
        DayNumber: eventData.DayNumber,
        Month: eventData.Month,
        Year: eventData.Year,
        TlCreationId: (timelineId) ? timelineId : null,
    }), [eventData]);

    const _timelines = useMemo(() => {
        const _result = timelines.map(item => ({id: item.Id, label: item.Name, name: item.Name}))

        if (!timelineId) {_result.push({id: null, label: "Текущий таймлайн"})}

        return _result
    },[timelines, timelineId])

    return (

        (_timelines.length > 0) && <div className="event-form">
            <button type="button" className="modal-form__close-button" onClick={closeModalCb}>Закрыть</button>
            <div className="title">
                <h6>
                    {(eventData && eventData.Id) ? 'Редактирование' : 'Создание'} события
                </h6>
            </div>

            <Form
                initialValues={formData}
                onSubmit={e => {e.preventDefault()}}
                validate={values => validate(values, [
                        {fieldName: 'TlCreationId', condition: !eventData.Id}])
                }
                render={({eventForm, submitting, pristine, values}) => (
                    <form className='event-form-tag'>
                        <div className='event-form__field'>
                                <Field name="Name"
                                       component={TextBox}
                                       label={"Название"}
                                       placeholder="Название"
                                       defaultValue={eventData && eventData.Name ? eventData.Name : ''}
                                       disabled={false}
                                       extClass={'event-name'}
                                >
                                </Field>
                        </div>

                            <Field name="ShortName"
                                   component={TextBox}
                                   label={"Краткое название"}
                                   placeholder="Краткое название"
                                   initialValue={formData.shortName}
                                   disabled={false}
                            extClass={'event-form__field'}>
                            </Field>

                            <Field name="Description"
                                   component={TextBox}
                                   label={"Описание"}
                                   placeholder="Описание"
                                   initialValue={formData.description}
                                   disabled={false}
                                   extClass={'event-form__field'}>
                            </Field>

                            <Field name="TlCreationId"
                                   component={Select}
                                   required={true}
                                   options={timelines.map((tm) => ({id: tm.Id, label: tm.Name, name: tm.Name}))}
                                   label={"Привязка к таймлайну"}
                                   placeholder="Привязка к таймлайну"
                                   initialValue={timelineId}
                                   disabled={!timelineId}
                                   extClass={'event-form__field'}>
                            </Field>

                            <Field name="DayNumber"
                                   component={TextBox}
                                   label={"Дата"}
                                   type={'number'}
                                   placeholder="Дата"
                                   initialValue={formData.Date}
                                   disabled={false}
                                   extClass={'event-form__field event-date'}>
                            </Field>

                            <Field name="Month"
                                   component={TextBox}
                                   type={'number'}
                                   label={"Месяц"}
                                   placeholder="Месяц"
                                   initialValue={formData.Month}
                                   disabled={false}
                                   extClass={'event-form__field event-date'}
                            >
                            </Field>

                            <Field name="Year"
                                   type={'number'}
                                   component={TextBox}
                                   label={"Год"}
                                   placeholder="Год"
                                   initialValue={formData.Year}
                                   disabled={false}
                                   extClass={'event-form__field event-date'}>
                            </Field>


                        <div className='event-form__field center'>
                            <button type={'button'} className="orange-button big-button" disabled={!validIs}
                                    onClick={() => props.onSave({id: eventData.Id, tableId: eventData.id, values: values})}>Сохранить
                            </button>
                        </div>


                        <FormSpy subscription={{values: true, pristine: true, errors: true}}
                                 onChange={({values, pristine, formValue, errors}) => {
                                     if(Object.values(errors).length === 0){
                                         setValid(true);
                                     }
                                     //some logic if it need
                                 }}/>
                    </form>
                )}/>
        </div>)
}

const validate = (values, disableValidationOnFields = []) => {
    const errors = {};

    if (!values.Year) {
        errors.StartYear = 'Required'
    }

    if (values.Year && (values.Year.length < 1)) {
        errors.StartMonth = 'Wrong value'
    }

    if (!values.Month) {
        errors.Month = 'Required'
    }

    if ((values.Month > 12) || (values.Month < 1)) {
        errors.StartMonth = 'Wrong value'
    }

    if (values.Year && !values.DayNumber && !values.Month) {
        errors.Month = 'Required'
    }

    // todo : сделать учет месяцев

    if ((values.DayNumber > 31) || (values.DayNumber < 1)) {
        errors.StartDay = 'Wrong value'
    }

    if (!values.Name || (values.Name && values.Name.length < 1)){
        errors.Name = 'Wrong values'
    }

    if (!values.ShortName || (values.ShortName && values.ShortName.length < 1)) {
        errors.ShortName = 'Required'
    }

    if (!values.Description || (values.Description && values.Description.length < 1)) {
        errors.Description = 'Wrong value'
    }

    if (!values.TlCreationId || (values.TlCreationId && isNaN(values.TlCreationId))) {
        errors.TlCreationId = 'Wrong value'
    }

    disableValidationOnFields.map(field => {
        field.condition && delete errors[field.fieldName];
    });

    return errors
};
