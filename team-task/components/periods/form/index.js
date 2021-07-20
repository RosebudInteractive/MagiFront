import React, {useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import './period-form.sass'
import validators from "../../../tools/validators";
import moment from "moment";

export default function PeriodForm(props) {
    const {periodData, timelineId, closeModalCb, timelines} = props;
    const [validIs, setValid] = useState(false);

    const formData = useMemo(() => ({
        name: (periodData && periodData.Name) ? periodData.Name : '',
        shortName: (periodData && periodData.ShortName) ? periodData.ShortName : '',
        description: (periodData && periodData.Description) ? periodData.Description : '',
        startDate: (periodData && periodData.startDate && (typeof periodData.startDate !== 'string')) ? new Date(periodData.startDate).getDate() : (periodData.StartDate && moment.isMoment(periodData.StartDate)) ? periodData.StartDate.toDate().getDate() : (periodData.StartDate) ? new Date(periodData.StartDate).getDate() : '',
        startMonth: (periodData && periodData.startDate && (typeof periodData.startDate !== 'string')) ? new Date(periodData.startDate).getMonth() + 1 : (periodData.StartDate && moment.isMoment(periodData.StartDate)) ? periodData.StartDate.toDate().getMonth() + 1 : (periodData.StartDate) ? new Date(periodData.StartDate).getMonth() + 1 : '',
        startYear: (periodData && periodData.startDate && (typeof periodData.startDate !== 'string')) ? new Date(periodData.startDate).getFullYear() : (periodData.StartDate && moment.isMoment(periodData.StartDate)) ? periodData.StartDate.toDate().getFullYear() : (periodData.StartDate) ? new Date(periodData.StartDate).getFullYear() : '',
        endDate: (periodData && periodData.endDate && (typeof periodData.endDate !== 'string')) ? new Date(periodData.endDate).getDate() : (periodData.EndDate && moment.isMoment(periodData.EndDate)) ? periodData.EndDate.toDate().getDate() : (periodData.EndDate) ? new Date(periodData.EndDate).getDate() : '',
        endMonth: (periodData && periodData.endDate && (typeof periodData.endDate !== 'string')) ? new Date(periodData.endDate).getMonth() + 1 : (periodData.EndDate && moment.isMoment(periodData.EndDate)) ? periodData.EndDate.toDate().getMonth() + 1 : (periodData.EndDate) ? new Date(periodData.EndDate).getMonth() + 1 : '',
        endYear: (periodData && periodData.endDate && (typeof periodData.endDate !== 'string')) ? new Date(periodData.endDate).getFullYear() : (periodData.EndDate && moment.isMoment(periodData.EndDate)) ? periodData.EndDate.toDate().getFullYear() : (periodData.EndDate) ? new Date(periodData.EndDate).getFullYear() + 1 : '',
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
                render={({periodForm, submitting, pristine, values, valid}) => (
                    <form className='period-form-tag'>
                        <div className='period-form__field'>
                            <div className="period-name">
                                <Field name="name"
                                       component={TextBox}
                                       label={"Название"}
                                       placeholder="Название"
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
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
                                   validate={(periodData && periodData.Id) ? validators.required : undefined}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='period-form__field'>
                            <Field name="description"
                                   component={TextBox}
                                   label={"Описание"}
                                   placeholder="Описание"
                                   validate={(periodData && periodData.Id) ? validators.required : undefined}
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
                                   validate={(periodData && periodData.Id) ? validators.required : undefined}
                                   disabled={!timelineId}>
                            </Field>
                        </div>


                        <div className="period-start-date">
                            <div className='period-form__field start-date'>
                                <Field name="startDate"
                                       component={TextBox}
                                       label={"Дата начала"}
                                       placeholder="Дата начала"
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
                                       initialValue={formData.startDate}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field'>
                                <Field name="startMonth"
                                       component={TextBox}
                                       label={"Месяц начала"}
                                       placeholder="Месяц начала"
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
                                       initialValue={formData.startMonth}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field'>
                                <Field name="startYear"
                                       component={TextBox}
                                       label={"Год начала"}
                                       placeholder="Год начала"
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
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
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
                                       placeholder="Дата окончания"
                                       initialValue={formData.endDate}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field end-date'>
                                <Field name="endMonth"
                                       component={TextBox}
                                       label={"Месяц окончания"}
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
                                       placeholder="Месяц окончания"
                                       initialValue={formData.endMonth}
                                       disabled={false}>
                                </Field>
                            </div>

                            <div className='period-form__field end-date'>
                                <Field name="endYear"
                                       component={TextBox}
                                       label={"Год окончания"}
                                       validate={(periodData && periodData.Id) ? validators.required : undefined}
                                       placeholder="Год окончания"
                                       initialValue={formData.endYear}
                                       disabled={false}>
                                </Field>
                            </div>
                        </div>





                        <div className='period-form__field center'>
                            <button type={'button'} className="orange-button big-button" disabled={!validIs}
                                    onClick={() => props.onSave(periodData.Id, values)}>Сохранить
                            </button>
                        </div>


                        <FormSpy subscription={{values: true, pristine: true}}
                                 onChange={({values, pristine}) => {
                                     if((periodData && periodData.Id)){
                                         setValid(true); //cause pristine
                                     } else {
                                         if(periodData){
                                             if((values.name && values.name.length > 0) &&
                                             (values.shortName && values.shortName.length > 0) &&
                                             (values.description && values.description.length > 0) &&
                                             (values.startDate) &&
                                             (values.endDate) &&
                                             (values.endYear) &&
                                             (values.endMonth) &&
                                             (values.startMonth) &&
                                             (values.startYear)){
                                                 setValid(true);
                                             }
                                         } //todo do same crazy shit in event form too
                                     }
                                     // (values.num)
                                     // name: (periodData && periodData.Name) ? periodData.Name : '',
                                     //     shortName: (periodData && periodData.ShortName) ? periodData.ShortName : '',
                                     //     description: (periodData && periodData.Description) ? periodData.Description : '',
                                     //     startDate: (periodData && periodData.startDate) ? new Date(periodData.startDate).getDate() : '',
                                     //     startMonth: (periodData && periodData.startDate) ? new Date(periodData.startDate).getMonth() + 1 : '',
                                     //     startYear: (periodData && periodData.startDate) ? new Date(periodData.startDate).getFullYear() : '',
                                     //     endDate: (periodData && periodData.endDate) ? new Date(periodData.endDate).getDate() : '',
                                     //     endMonth: (periodData && periodData.endDate) ? new Date(periodData.endDate).getMonth() + 1 : '',
                                     //     endYear: (periodData && periodData.endDate) ? new Date(periodData.endDate).getFullYear() : '',
                                     //     tlCreationId: (timelineId) ? timelineId : '',

                                     //some logic if it need
                                 }}/>
                    </form>
                )}/>
        </div>)
}
