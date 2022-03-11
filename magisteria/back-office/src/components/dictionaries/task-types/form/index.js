import React, {useEffect, useMemo, useState} from "react";
import {Field, Form} from "react-final-form";
import "./task-type-form.sass"
import "../../editor-form.sass"
import {MultipleSelect, TextBox } from '../../../ui-kit'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
        createTaskType, 
        currentTaskTypeSelector, 
        selectTaskType, 
        updateTaskType,
        getTaskType,
		getTaskTypes
    } from "tt-ducks/task";

import {
        getRights, 
        rolesPermissionsSelector,
        rightsDictionarySelector,
        getRolesWithPermissions
    } from "tt-ducks/access-rights-dictionary";

import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import './task-type-form.sass'

const TaskTypeForm = (props) => {
    const [createAction, setActionCreate] = useState(true);
    const {actions, taskTypeData, roles} = props;

    useEffect(() => {
        setActionCreate(!(taskTypeData && taskTypeData.Id));
        actions.getRights();
        actions.getRolesWithPermissions();
//        actions.getTaskType();

    }, [taskTypeData.Id]);


    const roleOptions = useMemo(() => {
        return roles.map(role => ({id: role.Id, name: role.Name}))
    }, [roles]);

    const roleNames = useMemo(() => {
        let shortCodesWithNames = {};
        roles.forEach(role => shortCodesWithNames[role.Id] = role.Name);
        return shortCodesWithNames;
    }, [roles]);

    useEffect(() => {
        console.log('roleOptions', roleOptions);
        console.log('roles', roles);
    }, [roleOptions, roles]);


    const closeModalForm = () => {
        console.log('close');
        actions.selectTaskType();
        props.history.push(`/dictionaries/task-types`);
    };

    const handleSubmit = (data) => {
        console.log('handleSubmit data ', data)

        const newData = {...data,
		  Code: data.code,
          Name: data.name,
          Description: data.description,
          Roles: Array.from(data.roles),
        };
        if(createAction){
          actions.createTaskType(newData);
            //create new component logic
        } else {
          actions.updateTaskType(data.Id, newData);
        };
        closeModalForm();
    };

    const taskTypeFormData = useMemo(() => ({
        code: taskTypeData.Code,
        name: taskTypeData.Name,
        Id: taskTypeData.Id,
        description: taskTypeData.Description,
        roles: taskTypeData.Roles ? taskTypeData.Roles.map( item=> item.Id ) :[],
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
                            <form className='editor-form task-type-form' onSubmit={e => {
                                e.preventDefault();
                                handleSubmit(taskTypeForm.values)
                            }}>

                                <div className="editor-form__two-pane-container">
                                    <div className='left-pane with-fields-column'>
                                        <div className='task-type-form__field'>
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
                                    <div className={'right-pane'}>
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
                                                            <Chip key={value} label={roleNames[value]}/>
                                                        ))}
                                                    </Box>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='editor-form__action-buttons'>
                                    <button type='submit'
                                            className="task-type-form__confirm-button orange-button big-button"
                                            disabled={!taskTypeForm.valid || taskTypeForm.pristine}>
                                        Применить
                                    </button>
                                </div>

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
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            selectTaskType,
            createTaskType,
            updateTaskType,
            getRights,
            getRolesWithPermissions,
            getTaskType,
			getTaskTypes,
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TaskTypeForm)

