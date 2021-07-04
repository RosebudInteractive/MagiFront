import React, {useEffect, useMemo, useState} from "react";
import {TIMELINE_STATE} from "../../../../constants/states";
import {Select, TextBox} from "../../../ui-kit";
import {TIMELINE_TYPES_OF_USE} from "../../../../constants/timelines";
import {Field, Form, FormSpy} from "react-final-form";
import './timeline-form.sass'

function TimelineForm(props) {
    const [createAction, setActionCreate] = useState(true);
    const {data, actions} = props;

    const timelineFormData = useMemo(() => ({
        name: (data && data.Name) ? data.Name : '',
        timeCr: (data && data.TimeCr) ? data.TimeCr.toLocaleDateString() : '',
        typeOfUse: (data && data.TypeOfUse) ? data.TypeOfUse : '',
        orderNumber: (data && data.orderNumber) ? data.orderNumber : '',
        state: (data && data.State) ? data.State : '',
        role: (data && data.Role) ? data.Role : '',
        backgroundImage: (data && data.BackgroundImage) ? data.BackgroundImage : '',
    }), [data]);

    useEffect(()=>{
        setActionCreate(!(data));
    }, [data]);

    const closeModalForm = () => {
        //todo close form action here

        // actions.toggleUserForm(false);
        // actions.cleanSelectedUser();
        // props.history.push(`/dictionaries/users`);
    };

    const handleSubmit = (timelineInfo) => {
        //todo save logic here
    };

    const _getUseTypes = () => {
        return Object.entries(TIMELINE_TYPES_OF_USE).map(type => ({id: type[0], name: type[1]}))
    };

    return <div className="timeline-form-block">
        <Form
            initialValues={
                timelineFormData
            }
            onSubmit={values => {
            }}
            validate={values => {
            }
            }>
            {
                (timelineForm) => (
                    <form className='timeline-form' onSubmit={e => {e.preventDefault(); handleSubmit(timelineForm.values)}}>

                        <div className='timeline-form__field'>
                            <Field
                                name="timeCr"
                                component={TextBox}
                                type="text"
                                placeholder="Время создания"
                                label={"Время создания"}
                                disabled={true}
                                defaultValue={data && data.TimeCr ? data.TimeCr.toLocaleDateString() : ''}
                            />
                        </div>
                        <div className='timeline-form__field'>
                            <Field
                                name="name"
                                component={TextBox}
                                placeholder="Название"
                                label={"Название"}
                                defaultValue={data && data.Name ? data.Name : ''}
                                multiple={false}
                            />
                        </div>
                        <div className='timeline-form__field'>
                            <Field name="typeOfUse"
                                   component={Select}
                                   label={"Тип использования"}
                                   placeholder="Тип использования"
                                   options={_getUseTypes()}
                                   defaultValue={data && data.TypeOfUse ? data.TypeOfUse : ''}
                                   disabled={true}>
                            </Field>
                        </div>

                        <div className='timeline-form__field'>
                            <Field name="orderNumber"
                                   component={TextBox}
                                   label={"Порядковый номер"}
                                   placeholder="Порядковый номер"
                                   disabled={true}>
                            </Field>
                        </div>

                        <div className='timeline-form__field'>
                            <Field name="state"
                                   component={TextBox}
                                   label={"Состояние"}
                                   placeholder="Состояние"
                                   format={value => Object.values(TIMELINE_STATE).find(item => item.value === value).label}
                                   disabled={true}>
                            </Field>
                        </div>

                        <div className='timeline-form__field'>
                            <Field name="backgroundImage"
                                   label={"Фоновая картинка"}
                                   placeholder="Фоновая картинка"
                                   disabled={false}>
                                {props => (
                                       <div className="file-input-field">
                                           <input {...props.input} type="file"/>
                                       </div>
                                )}
                            </Field>
                        </div>
                        <FormSpy subscription={{values: true, pristine: true}}
                                 onChange={({pristine}) => {
                                     props.onChangeFormCallback(pristine);
                                 }}/>
                    </form>
                )
            }
        </Form>
    </div>
}

export default TimelineForm;

