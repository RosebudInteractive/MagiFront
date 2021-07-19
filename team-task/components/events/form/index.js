import React, {useMemo} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import './event-form.sass'

export default function EventForm(props) {
    const {eventData, timelineId, closeModalCb, timelines} = props;
    const formData = useMemo(() => ({
        name: (eventData && eventData.Name) ? eventData.Name : '',
        shortName: (eventData && eventData.ShortName) ? eventData.ShortName : '',
        description: (eventData && eventData.Description) ? eventData.Description : '',
        date: (eventData && eventData.Date) ? new Date(eventData.Date).getDate() : '',
        month: (eventData && eventData.Date) ? new Date(eventData.Date).getMonth() + 1 : '',
        year: (eventData && eventData.Date) ? new Date(eventData.Date).getFullYear() : '',
        tlCreationId: (timelineId) ? timelineId : '',
    }), [eventData]);

    return (

        (timelines && timelines.length > 0) && <div className="event-form">
            <button type="button" className="modal-form__close-button" onClick={closeModalCb}>Закрыть</button>
            <div className="title">
                <h6>
                    {(eventData && eventData.Id) ? 'Редактирование' : 'Создание'} события
                </h6>
            </div>

            <Form
                initialValues={
                    formData
                }
                onSubmit={e => {
                    e.preventDefault()
                    console.log('onSubmit')
                }}
                validate={values => {
                }
                }
                subscription={{values: true, pristine: true}}
                render={({eventForm, submitting, pristine, values}) => (
                    <form className='event-form-tag'>
                        <div className='event-form__field'>
                            <div className="event-name">
                                <Field name="name"
                                       component={TextBox}
                                       label={"Название"}
                                       placeholder="Название"
                                       defaultValue={eventData && eventData.Name ? eventData.Name : ''}
                                       disabled={false}
                                >
                                </Field>
                            </div>
                        </div>

                        <div className='event-form__field'>
                            <Field name="shortName"
                                   component={TextBox}
                                   label={"Краткое название"}
                                   placeholder="Краткое название"
                                   initialValue={formData.shortName}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='event-form__field'>
                            <Field name="description"
                                   component={TextBox}
                                   label={"Описание"}
                                   placeholder="Описание"
                                   initialValue={formData.description}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='event-form__field'>
                            <Field name="tlCreationId"
                                   component={Select}
                                   options={timelines.map((tm) => ({id: tm.Id, label: tm.Name, name: tm.Name}))}
                                   label={"Привязка к таймлайну"}
                                   placeholder="Привязка к таймлайну"
                                   initialValue={timelineId}
                                   disabled={!timelineId}>
                            </Field>
                        </div>

                        <div className='event-form__field event-date'>
                            <Field name="date"
                                   component={TextBox}
                                   label={"Дата"}
                                   placeholder="Дата"
                                   initialValue={formData.Date}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='event-form__field event-date'>
                            <Field name="month"
                                   component={TextBox}
                                   label={"Месяц"}
                                   placeholder="Месяц"
                                   initialValue={formData.Month}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='event-form__field event-date'>
                            <Field name="year"
                                   component={TextBox}
                                   label={"Год"}
                                   placeholder="Год"
                                   initialValue={formData.Year}
                                   disabled={false}>
                            </Field>
                        </div>


                        <div className='event-form__field center'>
                            <button type={'button'} className="orange-button big-button" disabled={pristine}
                                    onClick={() => props.onSave(eventData.Id, values)}>Сохранить
                            </button>
                        </div>


                        <FormSpy subscription={{values: true, pristine: true}}
                                 onChange={({values, pristine, formValue}) => {

                                     //some logic if it need
                                 }}/>
                    </form>
                )}/>
        </div>)
}
