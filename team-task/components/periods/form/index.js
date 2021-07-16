import React, {useMemo} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import './period-form.sass'

export default function PeriodForm(props) {
    const {periodData, timelineId, closeModalCb, timelines} = props;
    const formData = useMemo(() => ({
        name: (periodData && periodData.Name) ? periodData.Name : '',
        shortName: (periodData && periodData.ShortName) ? periodData.ShortName : '',
        description: (periodData && periodData.Description) ? periodData.Description : '',
        startDate: (periodData && periodData.startDate) ? new Date(periodData.startDate).getDate() : '',
        startMonth: (periodData && periodData.startDate) ? new Date(periodData.startDate).getMonth() + 1 : '',
        startYear: (periodData && periodData.startDate) ? new Date(periodData.startDate).getFullYear() : '',
        endDate: (periodData && periodData.endDate) ? new Date(periodData.endDate).getDate() : '',
        endMonth: (periodData && periodData.endDate) ? new Date(periodData.endDate).getMonth() + 1 : '',
        endYear: (periodData && periodData.endDate) ? new Date(periodData.endDate).getFullYear() : '',
        tlCreationId: (timelineId) ? timelineId : '',
    }), [periodData]);

    return (

        (timelines && timelines.length > 0) && <div className="period-form">
            <button type="button" className="modal-form__close-button" onClick={closeModalCb}>Закрыть</button>
            <div className="title">
                <h6>
                    {(periodData && periodData.Id) ? 'Редактирование' : 'Создание'} периода
                </h6>
            </div>

            <Form
                initialValues={
                    formData
                }
                onSubmit={e => {
                    e.preventDefault();
                    // console.log('onSubmit');
                }}
                validate={values => {
                }
                }
                subscription={{values: true, pristine: true}}
                render={({periodForm, submitting, pristine, values}) => (
                    <form className='period-form-tag'>
                        <div className='period-form__field'>
                            <div className="period-name">
                                <Field name="name"
                                       component={TextBox}
                                       label={"Название"}
                                       placeholder="Название"
                                       defaultValue={periodData && periodData.Name ? periodData.Name : ''}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>

                        <div className='period-form__field'>
                            <Field name="shortName"
                                   component={TextBox}
                                   label={"Краткое название"}
                                   placeholder="Краткое название"
                                   initialValue={formData.shortName}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='period-form__field'>
                            <Field name="description"
                                   component={TextBox}
                                   label={"Описание"}
                                   placeholder="Описание"
                                   initialValue={formData.description}
                                   disabled={false}>
                            </Field>
                        </div>



                        <div className='period-form__field'>
                            <Field name="tlCreationId"
                                   component={Select}
                                   options={timelines.map((tm) => ({id: tm.Id, label: tm.Name, name: tm.Name}))}
                                   label={"Привязка к таймлайну"}
                                   placeholder="Привязка к таймлайну"
                                   initialValue={timelineId}
                                   disabled={!timelineId}>
                            </Field>
                        </div>


                        <div className="period-start-date">
                            <div className='period-form__field start-date'>
                                <Field name="startDate"
                                       component={TextBox}
                                       label={"Дата начала"}
                                       placeholder="Дата начала"
                                       initialValue={formData.startDate}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field'>
                                <Field name="startMonth"
                                       component={TextBox}
                                       label={"Месяц начала"}
                                       placeholder="Месяц начала"
                                       initialValue={formData.startMonth}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field'>
                                <Field name="startYear"
                                       component={TextBox}
                                       label={"Год начала"}
                                       placeholder="Год начала"
                                       initialValue={formData.startYear}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>

                        <div className="period-end-date">
                            <div className='period-form__field end-date'>
                                <Field name="endDate"
                                       component={TextBox}
                                       label={"Дата окончания"}
                                       placeholder="Дата окончания"
                                       initialValue={formData.endDate}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field end-date'>
                                <Field name="endMonth"
                                       component={TextBox}
                                       label={"Месяц окончания"}
                                       placeholder="Месяц окончания"
                                       initialValue={formData.endMonth}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field end-date'>
                                <Field name="endYear"
                                       component={TextBox}
                                       label={"Год окончания"}
                                       placeholder="Год окончания"
                                       initialValue={formData.endYear}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>





                        <div className='period-form__field center'>
                            <button type={'button'} className="orange-button big-button" disabled={pristine}
                                    onClick={() => props.onSave(periodData.Id, values)}>Сохранить
                            </button>
                        </div>


                        <FormSpy subscription={{values: true, pristine: true}}
                                 onChange={({values, pristine}) => {
                                     //some logic if it need
                                 }}/>
                    </form>
                )}/>
        </div>)
}
