import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import "./task-type-form.sass"
import {MultipleSelect, TextBox} from '../../../ui-kit'
import {
    cleanSelectedComponent,
    getComponents,
    saveComponentChanges,
    toggleComponentForm
} from "tt-ducks/components-dictionary";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {createTaskType, currentTaskTypeSelector, selectTaskType} from "../../../../ducks/task";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import {getRights, rightsDictionarySelector} from "../../../../ducks/access-rights-dictionary";
import './task-type-form.sass'


const TaskTypeForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const {actions, taskTypeData, roles} = props;

    useEffect(()=>{
        setActionCreate(!(taskTypeData && taskTypeData.Id));
        actions.getRights()
    }, [taskTypeData]);


    const roleOptions = useMemo(() => {
        return roles.map(role => ({id: role.Id, name: role.Name}))
    }, [roles]);

    const roleNames = useMemo(() => {
        let shortCodesWithNames = {};
        roles.forEach(role => shortCodesWithNames[role.Id] = role.Name);
        return shortCodesWithNames;
    }, [roles]);

    useEffect(() => {
        console.log('roleOptions', roleOptions)
        console.log('roles', roles)
    }, [roleOptions, roles]);



    const closeModalForm = () => {
        console.log('close');
        // actions.toggleComponentForm(false);
        // actions.cleanSelectedComponent();
        actions.selectTaskType();
        props.history.push(`/dictionaries/task-types`);
    };

    // const roleNames =

    // const responsibles = useMemo(() => {
    //     if(componentOwners.length > 0 && componentOwners.some(sup => sup.hasOwnProperty('Id'))){
    //         return componentOwners.map(sup => ({id: sup.Id, name: sup.DisplayName}))
    //     }
    // }, [componentOwners]);

    const handleSubmit = (data) => {
        console.log('handleSubmit data ', data)

        actions.createTaskType(data);
        // const newComponentData = {...componentData,
        //     SupervisorId: componentInfo.supervisorId,
        //     Name: componentInfo.name,
        // };
        // if(createAction){
        //     //create new component logic
        // } else {
        //     actions.saveComponentChanges(componentData.Id, newComponentData);
        //     actions.getComponents();
        // }

        closeModalForm()
    };

    const taskTypeFormData = useMemo(() => ({
        code: taskTypeData.Code,
        name: taskTypeData.Name,
        description: taskTypeData.Description,
        roles: [...taskTypeData.Roles],
    }), [taskTypeData]);

    return (
        <div className='outer-background'>
            <div className='inner-content'>
                <button type="button" className="modal-form__close-button" onClick={closeModalForm}>Закрыть</button>
                <div className="title">
                    <h6>
                        {createAction ? 'Создание' : 'Редактирование'} типа задачи
                    </h6>
                </div>
                < Form
                    initialValues={
                        taskTypeFormData
                    }
                    onSubmit={values => {
                    }}
                    validate={values => {
                    }
                    }>
                    {
                        (taskTypeForm) => (
                            <form className='task-type-form' onSubmit={e => {e.preventDefault(); handleSubmit(taskTypeForm.values)}}>

                                <div className="task-type-form-fields">
                                    <div className='task-type-form-info'>
                                        <div className='task-type-form__field email-field'>
                                            <Field
                                                name="code"
                                                component={TextBox}
                                                type="text"
                                                placeholder="Код"
                                                label={"Код"}
                                            />
                                        </div>

                                        <div className='task-type-form__field'>
                                            <Field
                                                name="name"
                                                component={TextBox}
                                                type="text"
                                                placeholder="Название"
                                                label={"Название"}
                                            />
                                        </div>

                                        <div className='task-type-form__field'>
                                            <Field
                                                name="description"
                                                component={TextBox}
                                                type="text"
                                                placeholder="Описание"
                                                label={"Описание"}
                                            />
                                        </div>
                                    </div>



                                    <div className={'task-type-form__roles'}>
                                        <div className='task-type-form__field'>
                                            <Field
                                                name="roles"
                                                component={MultipleSelect}
                                                multiple={true}
                                                label={"Роли"}
                                                required={true}
                                                options={roleOptions} //todo add all roles

                                                renderValue={(selected) => (
                                                    <Box className={'user-form__roles _with-custom-scroll'}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={roleNames[value]} />
                                                        ))}
                                                    </Box>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>



                                {/*<div className='component-form__field'>*/}
                                {/*    <Field*/}
                                {/*        name="supervisorId"*/}
                                {/*        component={Select}*/}
                                {/*        placeholder="Ответственный"*/}
                                {/*        label={"Ответственный"}*/}
                                {/*        options = {responsibles}*/}
                                {/*        defaultValue={componentData && componentData.SupervisorId ? componentData.SupervisorId : ''}*/}
                                {/*        multiple={false}*/}
                                {/*    />*/}
                                {/*</div>*/}
                                {/*<div className='component-form__field'>*/}
                                {/*    <Field name="structName"*/}
                                {/*           component={TextBox}*/}
                                {/*           label={"Структура Проекта"}*/}
                                {/*           placeholder="Структура Проекта"*/}
                                {/*           disabled={true}>*/}
                                {/*    </Field>*/}
                                {/*</div>*/}

                                <button type='submit' className="task-type-form__confirm-button orange-button big-button" disabled={!taskTypeForm.valid || taskTypeForm.pristine}>
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
        taskTypeData: currentTaskTypeSelector(state),
        roles: rightsDictionarySelector(state)
        // visible: componentFormOpenedSelector(state),
        // componentOwners: componentOwnersSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            selectTaskType,
            createTaskType,
            toggleComponentForm,
            cleanSelectedComponent,
            saveComponentChanges,
            getComponents,
            getRights
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TaskTypeForm)

