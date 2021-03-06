import React, {useEffect,} from "react"
import {bindActionCreators, compose} from "redux"
import {connect} from 'react-redux';
import {
    accessDeniedSelector,
    createTask,
    currentElementSelector,
    elementsSelector,
    fetchingSelector,
    getProcessElement,
    getTask,
    saveComment,
    saveTask,
    taskSelector,
    usersSelector,
    taskTypesSelector,
    getTaskTypes, 
} from "tt-ducks/task";
import TaskHeader from "../../components/task-page/header";
import {getFormValues, isDirty, isValid, reduxForm,} from "redux-form";
import TaskBody from "../../components/task-page/body";
import {hasAdminRights, hasSupervisorRights, userSelector,} from "tt-ducks/auth";
import "./task-page.sass"
import {COMMENT_ACTION} from "../../constants/common";
import moment from "moment";
import {Prompt} from "react-router-dom";
import {TASK_STATE} from "../../constants/states";
import AccessDeniedPlaceholder from "../../components/access-denied-placeholder";
import type {UpdatingCommentData} from "../../types/task";

const EDITOR_NAME = "TASK_EDITOR";

type EditorProps = {
    taskId: number,
    parentTaskId?: number,
    processId?: number,
    notifUuid? : string
}

function TaskEditor(props: EditorProps) {
    const {actions, task, fetching, accessDenied, hasChanges, editorValues, currentElement, taskId, processId, parentTaskId, notifUuid,
    hasAdminRights, hasSupervisorRights} = props;

    useEffect(() => {
        if (taskId === -1) {
            actions.createTask(processId)
        } else {
            actions.getTask(taskId, notifUuid ? notifUuid : null);
        }
    }, []);

    useEffect(() => {
        if (task) {
            const _object = {
                Name: task.Name,
                Description: task.Description,
                DueDate: task.DueDate ? moment(task.DueDate) : null,
                State: task.State,
                IsElemReady: !!task.IsElemReady,
                WriteFieldSet: task.WriteFieldSet,
                ElementId: task.Element && task.Element.Id,
                ExecutorId: task.Executor && task.Executor.Id,
                LastComment: "",
                TypeId: task.TypeId
            }

            task.Fields && task.Fields.forEach((field) => {
                _object[field.name] = field.type === 'boolean' ? Boolean(field.value) : field.value
            })

            props.initialize(_object)
        }
    }, [task])

    const _save = () => {
        const _commentText = editorValues.LastComment.trim() ? editorValues.LastComment : null

        const _value = {
            Id: task.Id,
            Name: editorValues.Name,
            State: +editorValues.State,
            ExecutorId: +editorValues.ExecutorId ? +editorValues.ExecutorId : null,
            Description: editorValues.Description,
            IsElemReady: !!editorValues.IsElemReady,
            WriteFieldSet: editorValues.WriteFieldSet,
            Comment: _commentText,
            TypeId: editorValues.TypeId
        }

        if (editorValues.DueDate) {
            _value.DueDate = editorValues.DueDate.toISOString()
        }

        if (+editorValues.ElementId) {
            _value.ElementId = +editorValues.ElementId
        }

        if (taskId === -1) {
            _value.ProcessId = processId
            if (+editorValues.TypeId) {
                _value.TypeId = +editorValues.TypeId
            };
            if (parentTaskId) {
                _value.Dependencies = [parentTaskId]
            };
        }

        _value.Fields = {}
        currentElement.Fields.forEach((field) => {
            const val = editorValues[field.name];
            _value.Fields[field.name] = field.type === 'boolean' ? Boolean(val) : val
        })

        actions.saveTask(_value)
    }

    const _saveComment = (id, text) => {
        const userComment: UpdatingCommentData = {
            id: id,
            text: text,
            action: text && text.trim() ? COMMENT_ACTION.UPDATE : COMMENT_ACTION.DELETE
        }

        actions.saveComment(userComment)
    }

    useEffect(() => {
        const _elemId = editorValues && editorValues.ElementId

        actions.getProcessElement(_elemId)
    }, [editorValues && editorValues.ElementId])

    useEffect(() => {
        console.log('actions.getTaskTypes()');
            actions.getTaskTypes();
    }, []);

    useEffect(() => {
        const _elemId = editorValues && editorValues.ElementId

        actions.getProcessElement(_elemId)
    }, [editorValues && editorValues.ElementId])

    const _onChangeElement = () => {

    }

    const _onStartClick = () => {
        const _task = {}
        _task.Id = task.Id
        _task.ElementId = task.Element && task.Element.Id
        _task.State = TASK_STATE.EXECUTING.value
        actions.saveTask(_task)
    }

    return !fetching ?
        <React.Fragment>
            {
                task && <React.Fragment>
                    <Prompt when={hasChanges}
                            message={'???????? ?????????????????????????? ????????????.\n ?????????????? ?????? ?????????????????????'}/>

                    <form className="task-editor-page form form-with-header__main-block"
                          onSubmit={e => e.preventDefault()}>
                        <TaskHeader hasChanged={hasChanges} taskId={taskId} processName={task.Process.Name}
                                    processId={task.Process.Id}
                                    onSave={_save}
                        linkActive={hasAdminRights || hasSupervisorRights}/>
                        <TaskBody task={task}
                                  elements={props.elements}
                                  currentWriteFieldSet={editorValues && editorValues.WriteFieldSet}
                                  users={props.users}
                                  editorValues={editorValues}
                                  taskTypes={props.taskTypes}
                                  currentElement={currentElement}
                                  onChangeElement={_onChangeElement}
                                  onStartClick={_onStartClick}
                                  onSaveComment={_saveComment}/>
                    </form>
                </React.Fragment>
            }
            {
                accessDenied && <AccessDeniedPlaceholder/>
            }
        </React.Fragment>
        : null
}

const validate = (values) => {
    const errors = {}

    return errors
}

const mapState2Props = (state) => {
    return {
        task: taskSelector(state),
        accessDenied: accessDeniedSelector(state),
        users: usersSelector(state),
        elements: elementsSelector(state),
        fetching: fetchingSelector(state),
        isSupervisor: hasSupervisorRights(state),
        currentElement: currentElementSelector(state),
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
        user: userSelector(state),
        hasSupervisorRights: hasSupervisorRights(state),
        hasAdminRights: hasAdminRights(state),
        taskTypes: taskTypesSelector(state),
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators(
        {   getTask, 
            createTask, 
            saveTask, 
            saveComment, 
            getProcessElement,
            getTaskTypes,
        }, dispatch)
    }
};

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
);

export default enhance(TaskEditor)
