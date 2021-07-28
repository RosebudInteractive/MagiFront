import React, {useMemo, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../ui-kit";
import './period-form.sass'

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

                        <Field name="TlCreationId"
                               component={Select}
                               options={timelines.map((tm) => ({id: tm.Id, label: tm.Name, name: tm.Name}))}
                               label={"Привязка к таймлайну"}
                               placeholder="Привязка к таймлайну"
                               initialValue={timelineId}
                               disabled={!timelineId}
                               extClass={'period-form__field'}>
                        </Field>
                        {/*</div>*/}


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
                                   type={'number'}
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
                                   type={'number'}
                                   placeholder="Год окончания"
                                   initialValue={formData.EndYear}
                                   disabled={false}
                                   extClass="period-form__field end-date"/>
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

                        <FormSpy subscription={{values: true, pristine: true, errors: true, submitting, touched: true}}
                                 onChange={({values, pristine, errors, submitting, touched}) => {
                                     if(Object.values(errors).length === 0){
                                         setValid(true);
                                     }

                                 }}/>
                    </form>
                )}/>
        </div>)
}


const validate = (values, disableValidationOnFields = []) => {
    const errors = {};

    if (!values.StartYear) {
        errors.StartYear = 'Required'
    }

    if (values.StartYear && !values.StartDay && !values.StartMonth) {
        errors.StartMonth = 'Required'
    }

    if (!values.StartMonth) {
        errors.StartMonth = 'Required'
    }

    if ((values.StartMonth > 12) || (values.StartMonth < 1)) {
        errors.StartMonth = 'Wrong value'
    }

    if (!values.EndYear) {
        errors.StartYear = 'Required'
    }

    if (values.EndYear && !values.EndDay && !values.EndMonth) {
        errors.EndMonth = 'Required'
    }

    if (!values.EndMonth) {
        errors.StartMonth = 'Required'
    }

    if ((values.EndMonth > 12) || (values.EndMonth < 1)) {
        errors.StartMonth = 'Wrong value'
    }

    // todo : сделать учет месяцев
    if ((values.StartDay > 31) || (values.StartDay < 1)) {
        errors.StartDay = 'Wrong value'
    }

    if ((values.EndDay > 31) || (values.EndDay < 1)) {
        errors.StartDay = 'Wrong value'
    }

    if (!values.Name || (values.Name && values.Name.length < 1)){
        errors.Name = 'Required'
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
