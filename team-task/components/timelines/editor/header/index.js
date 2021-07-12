import React, {useMemo, useState} from "react";
import BackArrow from "tt-assets/svg/back-arrow.svg";
import {TextBoxWithConfirm} from "../../../ui-kit";
import {TIMELINE_STATE} from "../../../../constants/states";
import './timeline-editor-header.sass'
import {Field, Form, FormSpy} from "react-final-form";

export default function TimelineEditorHeader(props) {
    const {name, state, mainFormPristine, onBack, onSave} = props;
    const [headerPristine, setHeaderPristine] = useState(true);
    const [currentValues, setCurrentValues] = useState({});

    const _state = useMemo(()=>{
    const result = Object.values(TIMELINE_STATE).find(item => item.value === state); //todo uncomment this after all complete
    return result ? result : {label: "Ошибка", css: "_error"}
    }, [state, name]);

    return <div className="timeline-editor-header">

        <div className="header__back-arrow" onClick={onBack}>
            <BackArrow/>
        </div>
        <Form
            initialValues={{
                name: name,
                state: state
            }}
            onSubmit={values => {
            }}
            validate={values => {
            }}
            subscription={{values: true, pristine: true}}
            render={({headerForm, submitting, pristine, values}) => (

                <form className='header-form' >
                    <div className='timeline-form__field'>
                        <div className="timeline-name">
                            <Field name="name"
                                   component={TextBoxWithConfirm}
                                   label={"Название таймлайна"}
                                   placeholder="Название таймлайна"
                                   // initialValue={name} todo mayby use it
                                   // defaultValue={name}
                                   disabled={false}>
                            </Field>
                        </div>
                    </div>

                    <div className='timeline-form__field'>
                        <Field name="state"
                               label={"Состояние"}
                               placeholder="Состояние"
                               // initialValue={state} todo mayby use it
                               // value={state}
                               disabled={true}>
                            {props => (
                                <div className={`state`}>
                                    <input {...props.input} hidden={true}/>
                                </div>
                            )}
                        </Field>
                    </div>

                    <FormSpy subscription={{values: true, pristine: true}}
                             onChange={({values, pristine}) => {
                                 setTimeout(() => {
                                     setCurrentValues(values);
                                     setHeaderPristine(pristine);
                                 }, 0);
                             }}/>
                </form>
            )
            }
        />
        <div className={"header__timeline-state font-body-s " + _state.css}>{_state.label}</div>

        <button className="timeline-editor-header__save-button orange-button big-button"
                disabled={!(!(headerPristine === true) && !(mainFormPristine === true))}
                onClick={() => {currentValues && onSave(currentValues)}}>
            Сохранить
        </button>
    </div>
}
