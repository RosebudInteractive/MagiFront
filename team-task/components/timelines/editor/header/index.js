import React, {useEffect, useMemo, useState} from "react";
import BackArrow from "tt-assets/svg/back-arrow.svg";
import {TitleTextBox} from "../../../ui-kit";
import {TIMELINE_STATE} from "../../../../constants/states";
import './timeline-editor-header.sass'
import {Field, Form, FormSpy} from "react-final-form";

export default function TimelineEditorHeader(props) {
    const {name, state, mainFormPristine, onBack, onSave, isCreate, onPristineChanged} = props;
    const [headerPristine, setHeaderPristine] = useState(true);
    const [currentValues, setCurrentValues] = useState({});

    useEffect(() => {
        onPristineChanged(headerPristine)
    }, [headerPristine]);

    const _state = useMemo(() => {
        const result = Object.values(TIMELINE_STATE).find(item => item.value === state);
        return result ? result : {label: "Ошибка", css: "_error"}
    }, [state, name]);

    return <div className="timeline-editor-header">

        <div className="header__back-arrow" onClick={() => onBack(headerPristine)}>
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

                <form className='header-form'>
                    <div className='timeline-form__field'>
                        <div className="timeline-name">
                            <Field name="name"
                                   component={TitleTextBox}
                                   label={"Название таймлайна"}
                                   placeholder="Название таймлайна"
                                   disabled={false}
                                   extClass="_grey100 page-title">
                            </Field>
                        </div>
                    </div>

                    <div className='timeline-form__field'>
                        <Field name="state"
                               label={"Состояние"}
                               placeholder="Состояние"
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
                disabled={(headerPristine && mainFormPristine) }
                onClick={() => {
                    currentValues && onSave(currentValues)
                }}>
            {/*{headerPristine.toString()}*/}
            {/*{mainFormPristine.toString()}*/}
            {/*{((headerPristine || mainFormPristine)).toString()}*/}
            Сохранить
        </button>
    </div>
}
