import React, {useMemo, useRef, useState} from "react";
import {Field, Form, FormSpy} from "react-final-form";
import {Select, TextBox} from "../../../../ui-kit";
import './script-command-form.sass'

export const SCRIPT_COMMANDS = [
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
    const [worksWithEventsState, setWorksWithEventsState] = useState(commandData && [1,3].includes(commandData.Command));

    const eventsOptions = useMemo(() => {
        return events.map(ev => ({id: ev.Id, name: ev.Name}))
    }, [events]);

    const periodsOptions = useMemo(() => {
        return periods.map(ev => ({id: ev.Id, name: ev.Name}))
    }, [periods]);

    const formData = useMemo(() => ({
        Timecode: commandData.Timecode,
        Command: commandData.Command,
        Periods: commandData.Periods  && commandData.Periods.length > 0 ? commandData.Periods : [],
        Events: commandData.Events && commandData.Events.length > 0 ? commandData.Events : []
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
                                   disabled={false}>
                            </Field>
                        </div>

                        <div className='script-timestamp-form__field'>

                            <Field name="Command"
                                   component={Select}
                                   required={true}
                                   options={SCRIPT_COMMANDS}
                                   label={"Команда"}
                                   placeholder="Команда"
                                   disabled={false}>
                            </Field>
                        </div>
                    </div>


                    <div className="arguments">
                        <div className='script-timestamp-form__field'>

                            {
                                worksWithEventsState &&
                                <Field name="Events"
                                       component={Select}
                                       multiple={true}
                                       required={true}
                                       options={eventsOptions}
                                       label={"Аргументы"}
                                       placeholder="Аргументы"
                                       disabled={false}>
                                </Field>
                            }

                            {
                                !worksWithEventsState &&
                                <Field name="Periods"
                                       component={Select}
                                       multiple={true}
                                       required={true}
                                       options={periodsOptions}
                                       label={"Аргументы"}
                                       placeholder="Аргументы"
                                       disabled={false}>
                                </Field>
                            }

                        </div>
                    </div>



                    <div className='script-timestamp-form__field center'>
                        <button type={'button'} className="orange-button big-button" disabled={!validIs}
                                onClick={() => props.onSave({
                                    id: commandData.Id,
                                    tableId: commandData.id,
                                    values: values
                                })}>Сохранить
                        </button>
                    </div>

                    <FormSpy subscription={{values: true, pristine: true, errors: true, submitting, touched: true}}
                             onChange={({values, pristine, errors, submitting, touched}) => {
                                 setWorksWithEventsState([1,3].includes(values.Command));
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

    const errors = {};

    if(vals.Timecode < 0){
        errors.Timecode = 'Значение должно быть от 0';
    }

    if(vals.Timecode === undefined || vals.Timecode === ''){
        errors.Timecode = 'Обязательное поле';
    }

    if(vals.Command === undefined || vals.Command === '' || isNaN(vals.Command)){
        errors.Command = 'Обязательное поле'
    }

    disableValidationOnFields.map(field => {
        field.condition && delete errors[field.fieldName];
    });

    return errors
};
