import React, {useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {TextBox} from "../../../../ui-kit";
import './event-form.sass'
import {TIMELINE_STATE} from "../../../../../constants/states";
import moment from "moment";

export default function EventForm(props) {
    const {eventData, timelineId, closeModalCb, timelines} = props;
    const [validIs, setValid] = useState(false);
    const [formPristine, setFormPristine] = useState(true);


    const _state = useMemo(() => {
        const result = Object.values(TIMELINE_STATE).find(item => item.value === eventData.State);
        return result ? result : {label: "Ошибка", css: "_error"}
    }, [eventData.State]);


    const formData = useMemo(() => ({
        Name: eventData.Name,
        ShortName: eventData.ShortName,
        Description: eventData.Description,
        DayNumber: eventData.DayNumber,
        Month: eventData.Month,
        Year: eventData.Year,
    }), [eventData]);

    return <div className="event-form">
            <button type="button" className="modal-form__close-button" onClick={() => closeModalCb(!formPristine)}>Закрыть
            </button>
            <div className="title">
                <h6>
                    {(eventData && eventData.Id) ? 'Редактирование' : 'Создание'} события
                </h6>

                <div className={"header__timeline-state font-body-s " + _state.css}>{_state.label}</div>
            </div>

            <Form
                initialValues={formData}
                onSubmit={e => {
                    e.preventDefault()
                }}
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

                        <div className="ev-date-block">
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
                                   component={TextBox}
                                   label={"Год"}
                                   placeholder="Год"
                                   initialValue={formData.Year}
                                   disabled={false}
                                   extClass={'event-form__field event-date'}>
                            </Field>
                        </div>


                        <div className='event-form__field center'>
                            <button type={'button'} className="orange-button big-button"
                                    disabled={((validIs) && !formPristine) !== true}
                                    onClick={() => props.onSave({
                                        id: eventData.Id,
                                        tableId: eventData.id,
                                        values: values
                                    })}>Сохранить
                            </button>
                        </div>


                        <FormSpy subscription={{values: true, pristine: true, errors: true}}
                                 onChange={({values, pristine, formValue, errors}) => {
                                     setFormPristine(pristine);
                                     setValid(Object.values(errors).length === 0);
                                 }}/>
                    </form>
                )}/>
        </div>
}

const validate = (values, disableValidationOnFields = []) => {
    const errors = {};

    if (!values.Year) {
        errors.Year = 'Обязательное поле'
    }

    if (values.Month && ((values.Month > 12) || (values.Month < 1))) {
        errors.Month = 'Неправильное значение'
    }

    if (values.Year && values.DayNumber && !values.Month) {
        errors.Month = 'Обязательное поле'
    }

    if (values.DayNumber && ((values.DayNumber > 31) || (values.DayNumber < 1))) {
        errors.DayNumber = 'Неправильное значение'
    }

    if (!values.Name || (values.Name && values.Name.length < 1)) {
        errors.Name = 'Неправильное значение'
    }

    if (values.DayNumber && values.Year && values.Month) {
        const dateObj = moment({
                year: values.Year,
                month: parseInt(values.Month - 1),
                day: values.DayNumber
            }
        );
        if (!dateObj.isValid()) {
            errors.DayNumber = 'Неправильная дата';
        }
    }

    disableValidationOnFields.map(field => {
        field.condition && delete errors[field.fieldName];
    });

    return errors
};
