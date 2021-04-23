import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import "./form.sass"
import {Select, TextBox} from '../../../ui-kit'
import {
    cleanSelectedComponent,
    componentFormOpenedSelector,
    saveComponentChanges,
    selectedComponentSelector,
    toggleComponentForm
} from "tt-ducks/components-dictionary";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {EMAIL_REGEXP} from "../../../../../common/constants/common-consts";
import {userWithSupervisorRightsSelectorFlatten} from "tt-ducks/dictionary";

const vRequired = value => (value ? undefined : 'Обязательное поле');
const vMinValue = min => value =>
    isNaN(value) || value >= min ? undefined : `Необходимое количество символов ${min}`;
const vMustBeEmail = value => (EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
const ComposeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);


const ComponentForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const { componentData, visible, actions, supervisors} = props;

    useEffect(()=>{
        setActionCreate(!(componentData && componentData.Id));
    }, [componentData]);

    const closeModalForm = () => {
        actions.toggleComponentForm(false);
        actions.cleanSelectedComponent();
    };

    const responsibles = useMemo(() => {
        if(supervisors.length > 0 && supervisors.some(sup => sup.hasOwnProperty('Id'))){
            return supervisors.map(sup => ({id: sup.Id, name: sup.DisplayName}))
        }
    }, [supervisors]);

    const handleSubmit = (componentInfo) => {
        const newComponentData = {...componentData,
            SupervisorId: componentInfo.supervisorId,
            Name: componentInfo.name,
            };
        if(createAction){
            //create new component logic
        } else {
            actions.saveComponentChanges(componentData.Id, newComponentData);
        }

        closeModalForm()
    };

    const componentFormData = useMemo(() => ({
        name: (componentData && componentData.Name) ? componentData.Name : '',
        supervisorId: (componentData && componentData.SupervisorId) ? componentData.SupervisorId : '',
        structName: (componentData && componentData.StructName) ? componentData.StructName : ''
    }), [componentData]);

    return (
        (visible && (supervisors && supervisors.length > 0)) &&
        <div className='outer-background'>
            <div className='inner-content'>
                <button type="button" className="element-editor__close-button" onClick={closeModalForm}>Закрыть</button>
                <div className="title">
                    <h6>
                        {createAction ? 'Создание' : 'Редактирование'} Компонента
                    </h6>
                </div>
                < Form
                    initialValues={
                        componentFormData
                    }
                     onSubmit={values => {
                     }}
                    validate={values => {
                    }
                    }>
                    {
                        (componentForm) => (
                            <form className='component-form' onSubmit={e => {e.preventDefault(); handleSubmit(componentForm.values)}}>

                                <div className='component-form__field email-field'>
                                        <Field
                                            name="name"
                                            component={TextBox}
                                            type="text"
                                            placeholder="Имя компонента"
                                            label={"Имя компонента"}
                                            validate={vRequired}
                                        />
                                </div>
                                <div className='component-form__field'>
                                    <Field
                                        name="supervisorId"
                                        component={Select}
                                        // type="text"
                                        placeholder="Ответственный"
                                        label={"Ответственный"}
                                        options = {responsibles}
                                        defaultValue={componentData && componentData.SupervisorId ? componentData.SupervisorId : ''}
                                        multiple={false}
                                        />
                                </div>
                                <div className='component-form__field'>
                                    <Field name="structName"
                                           component={TextBox}
                                           label={"Структура Проекта"}
                                           placeholder="Структура Проекта"
                                           validate={vRequired}>
                                    </Field>
                                </div>

                                <button type='submit' className="component-form__confirm-button orange-button big-button" disabled={!componentForm.valid}>
                                   Применить
                                </button>

                            </form>
                        )
                    }
                </Form>
            </div>
        </div>
    )
};

const mapState2Props = (state) => {
    return {
        componentData: selectedComponentSelector(state),
        visible: componentFormOpenedSelector(state),
        supervisors: userWithSupervisorRightsSelectorFlatten(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            toggleComponentForm,
            cleanSelectedComponent,
            saveComponentChanges
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(ComponentForm)

