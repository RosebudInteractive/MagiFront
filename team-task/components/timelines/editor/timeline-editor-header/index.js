import React, {useMemo, useState} from "react";
import BackArrow from "tt-assets/svg/back-arrow.svg";
import {TextBoxWithConfirm} from "../../../ui-kit";
import {TIMELINE_STATE} from "../../../../constants/states";
import './timeline-editor-header.sass'
import {Field, Form, FormSpy} from "react-final-form";

export default function TimelineEditorHeader(props) {
    const {name, state, mainFormPristine, onBack} = props;
    const [headerPristine, setHeaderPristine] = useState(true);

    const handleSubmit = (val) => {
        //todo finish this
    };

    const _state = useMemo(()=>{
    const result = Object.values(TIMELINE_STATE).find(item => item.value === state); //todo uncomment this after all complete
    return result ? result : {label: "Ошибка", css: "_error"}
    }, [state]);

    return <div className="timeline-editor-header">

        <div className="header__back-arrow" onClick={onBack}>
            <BackArrow/>
        </div>
        <Form
            onSubmit={values => {
            }}
            validate={values => {
            }}
            subscription={{values: true, pristine: true}}
            render={({headerForm, submitting, pristine, values}) => (
                <form className='header-form' onSubmit={e => {
                    e.preventDefault();
                    handleSubmit(headerForm.values)
                }}>
                    <div className='timeline-form__field'>
                        <Field name="name"
                               component={TextBoxWithConfirm}
                               label={"Название таймлайна"}
                               placeholder="Название таймлайна"
                               initialValue={name}
                               disabled={false}>
                        </Field>
                    </div>

                    <div className='timeline-form__field'>
                        <Field name="state"
                               label={"Состояние"}
                               placeholder="Состояние"
                               initialValue={state}
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
                                 setHeaderPristine(pristine)
                             }}/>
                </form>
            )
            }
        />
        <div className={"header__timeline-state font-body-s " + _state.css}>{_state.label}</div>

        <button className="timeline-editor-header__save-button orange-button big-button"
                disabled={(headerPristine && mainFormPristine)}
                onClick={props.onSave}>
            Сохранить
        </button>
    </div>
}
