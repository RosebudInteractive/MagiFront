import React, {useMemo, useRef, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../../../ui-kit";
import './script-command-form.sass'
import {TIMELINE_STATE} from "../../../../../constants/states";

const SCRIPT_COMMANDS = [
    {id: 0, name: 'Показать периоды'},
    {id: 1, name: 'Показать события'},
    {id: 2, name: 'Скрыть периоды'},
    {id: 3, name: 'Скрыть события'}
];

export default function ScriptCommandForm(props) {
    const {commandData, closeModalCb, events, periods} = props;
    const [validIs, setValid] = useState(false);
    const [formPristine, setFormPristine] = useState(true);
    const worksWithEvents = useRef(commandData && [1,3].includes(commandData.Command));

    const _state = useMemo(() => {
        console.log('commandData.State', commandData);
        const result = Object.values(TIMELINE_STATE).find(item => item.value === commandData.State);
        return result ? result : {label: "Ошибка", css: "_error"}
    }, [commandData.State]);

    const commandArgumentOptions = useMemo(() => {
        // let options = (commandData && commandData.Id && commandData.C) ? ;
        // (commandData && commandData.Id)
        return worksWithEvents.current !== null && worksWithEvents.current ?
            events.map(ev => ({id: ev.Id, name: ev.Name})) :
            periods.map(per => ({id: per.Id, name: per.Name}))
    }, [worksWithEvents.current]);

    const formData = useMemo(() => ({
        Timecode: commandData.Timecode,
        Command: commandData.Command,
        CommandArguments: commandData.CommandArguments
        // showEvents: commandData.showEvents,
        // hideEvents: commandData.hideEvents,
        // showPeriods: commandData.showPeriods,
        // hidePeriods: commandData.hidePeriods
        // Name: periodData.Name,
        // ShortName: periodData.ShortName,
        // Description: periodData.Description,
        // LbDay: periodData.LbDay,
        // LbMonth: periodData.LbMonth,
        // LbYear: periodData.LbYear,
        // RbDay: periodData.RbDay,
        // RbMonth: periodData.RbMonth,
        // RbYear: periodData.RbYear,
    }), [commandData]);

    return <div className="script-timestamp-form">
        <button type="button" className="modal-form__close-button" onClick={() => closeModalCb(!formPristine)}>Закрыть</button>
        <div className="title">
            <h6>
                {((commandData && commandData.Id) || commandData.id) ? 'Редактирование' : 'Создание'} команды скрипта
            </h6>

        </div>

        <Form
            initialValues={formData}
            onSubmit={e => {e.preventDefault()}}
            validate={values => validate(values, [
                {fieldName: 'TlCreationId', condition: !commandData.Id}])
            }
            subscription={{values: true, pristine: true}}
            render={({form, submitting, pristine, values, valid, errors, touched}) => (
                <form className='script-timestamp-form-tag'>
                    <div className='timecode-and-command'>
                        <div className='script-timestamp-form__field'>
                            <Field name="Timecode"
                                   component={TextBox}
                                   type="number"
                                   inputProps={{
                                       step: "0.1"
                                   }}
                                   label={"Время"}
                                   placeholder="Время"
                                   defaultValue={commandData && commandData.Timecode ? commandData.Timecode : ''}
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='script-timestamp-form__field'>
                            <Field name="Command"
                                   component={Select}
                                   options={SCRIPT_COMMANDS}
                                   label={"Команда"}
                                   onChange={(val) => {
                                       console.log('command val is', val)
                                   }}
                                   placeholder="Команда"
                                   defaultValue={commandData && commandData.Command ? commandData.Command : ''}
                                   disabled={false}>
                            </Field>
                        </div>
                    </div>


                    <div className="arguments">
                        <div className='script-timestamp-form__field'>
                            <Field name="CommandArguments"
                                   component={Select}
                                   multiple={true}
                                   options={commandArgumentOptions}
                                   label={"Название"}
                                   placeholder="Название"
                                   defaultValue={commandData && commandData.CommandArguments ? commandData.CommandArguments : []}
                                   disabled={false}>
                            </Field>
                        </div>
                    </div>



                    <div className='script-timestamp-form__field center'>
                        <button type={'button'} className="orange-button big-button" disabled={((validIs) && !formPristine) !== true}
                                onClick={() => props.onSave({
                                    id: commandData.Id,
                                    tableId: commandData.id,
                                    values: values
                                })}>Сохранить
                        </button>
                    </div>

                    <FormSpy subscription={{values: true, pristine: true, errors: true, submitting, touched: true}}
                             onChange={({values, pristine, errors, submitting, touched}) => {
                                 // console.log('values', values)
                                 worksWithEvents.current = [1,3].includes(values.Command);
                                 setFormPristine(pristine);
                                 setValid(Object.values(errors).length === 0);
                             }}/>
                </form>
            )}/>
    </div>
}


const validate = (values, disableValidationOnFields = []) => {
    const vals = values;

    vals.Timecode = parseFloat(vals.Timecode);
    vals.Command = parseInt(vals.Command);
    // vals.CommandArguments =

    // vals.LbYear = parseInt(vals.LbYear);
    // vals.LbMonth = parseInt(vals.LbMonth);
    // vals.LbDay = parseInt(vals.LbDay);
    // vals.RbYear = parseInt(vals.RbYear);
    // vals.RbMonth = parseInt(vals.RbMonth);
    // vals.RbDay = parseInt(vals.RbDay);

    const errors = {};

    if(vals.Timecode < 0){
        vals.Timecode = 'Значение должно быть > 0';
    }

    if(!vals.Timecode){
        vals.Timecode = 'Обязательное поле';
    }

    //todo finish this



    // if (vals.LbYear && vals.LbDay && !vals.LbMonth && !vals.LbMonth !== 0) {
    //     errors.LbMonth = 'Обязательное поле'
    // }
    //
    // if ((vals.LbMonth || vals.LbMonth === 0) && (vals.LbMonth > 12 || vals.LbMonth < 1)) {
    //     errors.LbMonth = 'Неправильное значение'
    // }
    //
    // if ((!vals.RbYear && !vals.LbYear)) {
    //     errors.RbYear = 'Обязательное поле';
    //     errors.LbYear = 'Обязательное поле';
    // }
    //
    // if((isNaN(vals.LbYear) || (vals.LbYear === 0))){
    //     errors.LbYear = 'Неправильное значение'
    // }
    //
    // if((isNaN(vals.RbYear) || (vals.RbYear === 0))){
    //     errors.RbYear = 'Неправильное значение'
    // }
    //
    // if (vals.RbYear && vals.RbDay && !vals.RbMonth && !vals.RbMonth !== 0) {
    //     errors.RbMonth = 'Обязательное поле'
    // }
    //
    // if ((vals.RbMonth || vals.RbMonth === 0) && (vals.RbMonth > 12) || (vals.RbMonth < 1)) {
    //     errors.RbMonth = 'Неправильное значение'
    // }
    //
    // if (vals.LbDay && (vals.LbDay > 31) || (vals.LbDay < 1)) {
    //     errors.LbDay = 'Неправильное значение'
    // }
    //
    // if (vals.RbDay && (vals.RbDay > 31) || (vals.RbDay < 1)) {
    //     errors.RbDay = 'Неправильное значение'
    // }
    //
    // if (!vals.Name || (vals.Name && vals.Name.length < 1)){
    //     errors.Name = 'Обязательное поле'
    // }
    //
    // if (vals.LbDay && vals.LbYear && vals.LbMonth) {
    //     const dateObj = moment({
    //             year: vals.LbYear,
    //             month: parseInt(vals.LbMonth - 1),
    //             day: vals.LbDay
    //         }
    //     );
    //     if (!dateObj.isValid()) {
    //         errors.LbDay = 'Неправильная дата';
    //     }
    // }
    //
    // if (vals.RbYear && vals.RbMonth && vals.RbDay) {
    //     const dateObj = moment({
    //             year: vals.RbYear,
    //             month: parseInt(vals.RbMonth - 1),
    //             day: vals.RbDay
    //         }
    //     );
    //     if (!dateObj.isValid()) {
    //         errors.RbDay = 'Неправильная дата';
    //     }
    // }
    //
    // if(vals.LbYear && vals.RbYear && (vals.LbYear >= vals.RbYear) && !(vals.RbMonth && vals.LbMonth) && !(vals.LbDay && vals.RbDay)){
    //     errors.LbYear = "Неправильный интервал дат";
    //     errors.RbYear = "Неправильный интервал дат";
    // }
    //
    // if(vals.LbYear && vals.RbYear && (vals.LbMonth && vals.RbMonth) && (vals.LbMonth >= vals.RbMonth) && (vals.LbYear === vals.RbYear) && !(vals.LbDay && vals.RbDay)){
    //     errors.LbMonth = "Неправильный интервал дат";
    //     errors.RbMonth = "Неправильный интервал дат";
    // }
    //
    // if((vals.LbYear && vals.RbYear) && ((!vals.LbMonth || !vals.RbMonth)) && (vals.LbYear === vals.RbYear) && !(vals.LbDay && vals.RbDay)){
    //     errors.LbMonth = "Неправильный интервал дат";
    //     errors.RbMonth = "Неправильный интервал дат";
    // }
    //
    // if((vals.LbYear && vals.RbYear) && (vals.LbMonth && vals.RbMonth) && (vals.LbYear === vals.RbYear)  && (vals.LbMonth === vals.RbMonth) && !(vals.LbDay || vals.RbDay)){
    //     errors.LbDay = "Неправильный интервал дат";
    //     errors.RbDay = "Неправильный интервал дат";
    // }
    //
    // if((vals.LbYear && vals.RbYear) && (vals.LbMonth && vals.RbMonth) && (vals.LbYear === vals.RbYear) &&
    //     (vals.LbDay && vals.RbDay) && (vals.LbMonth >= vals.RbMonth) && (vals.LbDay >= vals.RbDay)){
    //     errors.LbDay = "Неправильный интервал дат";
    //     errors.RbDay = "Неправильный интервал дат";
    // }
    //
    // if((vals.LbYear && vals.RbYear) && (vals.RbMonth && vals.LbMonth) && (vals.LbDay && vals.RbDay) && (vals.LbYear > vals.RbYear)){
    //     errors.LbYear = "Неправильный интервал дат";
    //     errors.RbYear = "Неправильный интервал дат";
    // }
    //
    //
    // disableValidationOnFields.map(field => {
    //     field.condition && delete errors[field.fieldName];
    // });

    return errors
};
