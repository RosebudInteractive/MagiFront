import React, {useEffect, useRef, useMemo, useState} from "react"
import {compose} from "redux"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    getTask,
    createTask,
    saveTask,
    getProcessElement,
    taskSelector,
    usersSelector,
    elementsSelector,
    fetchingSelector,
    currentElementSelector
} from "tt-ducks/task";
import TaskHeader from "../../components/task-page/header";
import {getFormValues, isDirty, isValid, reduxForm,} from "redux-form";
import TaskBody from "../../components/task-page/body";
import {hasSupervisorRights, userSelector,} from "tt-ducks/auth";
import "./task-page.sass"
import {COMMENT_ACTION} from "../../constants/common";
import moment from "moment";

const EDITOR_NAME = "TASK_EDITOR"

type EditorProps = {
    taskId: number,
    processId: ?number,
}

function TaskEditor(props: EditorProps) {
    const {actions, task, fetching, isSupervisor, hasChanges, editorValues, currentElement, taskId, processId} = props

    useEffect(() => {
        if (taskId === -1) {
            actions.createTask(processId)
        } else {
            actions.getTask(taskId)
        }
    }, [])

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
                LastComment: task.UserLastComment ? task.UserLastComment.Text : "",
            }

            task.Fields && task.Fields.forEach((field) => {
                _object[field.name] = field.value
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
            Comment: !task.UserLastComment ? _commentText  : null,
        }

        if (editorValues.DueDate) {
            _value.DueDate = editorValues.DueDate.toISOString()
        }

        if (+editorValues.ElementId) {
            _value.ElementId = +editorValues.ElementId
        }

        if (taskId === -1) {
            _value.ProcessId = processId
        }

        _value.Fields = {}
        currentElement.Fields.forEach((field) => {
            _value.Fields[field.name] = editorValues[field.name]
        })

        // Если есть последний комментарий пользователя и он его поменял, то
        // при смене статуса этот комментарий будет новым в логе, если статус не поменялся, а комментарий изменился, то
        // если новый комментарий пустой, запись надо удалить, иначе обновить
        let userCommentAction = null
        if (task.UserLastComment && (task.UserLastComment !== _commentText)) {
            if (task.State !== _value.State) {
                _value.Comment = _commentText
            } else {
                userCommentAction = {
                    id: task.UserLastComment.Id,
                    text: _commentText,
                    action: _commentText && _commentText.trim() ? COMMENT_ACTION.UPDATE : COMMENT_ACTION.DELETE
                }
            }
        }

        actions.saveTask({task: _value, comment: userCommentAction})
    }

    useEffect(() => {
        const _elemId = editorValues && editorValues.ElementId

        actions.getProcessElement(_elemId)
    }, [editorValues && editorValues.ElementId])

    useEffect(() => {
        const _elemId = editorValues && editorValues.ElementId

        actions.getProcessElement(_elemId)
    }, [editorValues && editorValues.ElementId])

    const _onChangeElement = () => {

    }


    return !fetching && task &&
        <form className="task-editor-page form form-with-header__main-block" onSubmit={e => e.preventDefault()}>
            <TaskHeader hasChanged={hasChanges} taskId={taskId} processName={task.Process.Name} onSave={_save}/>
            <TaskBody task={task}
                      isSupervisor={isSupervisor}
                      elements={props.elements}
                      currentWriteFieldSet={editorValues && editorValues.WriteFieldSet}
                      users={props.users}
                      currentElement={currentElement}
                      onChangeElement={_onChangeElement}/>
        </form>
}

const validate = (values) => {
    const errors = {}

    return errors
}

const mapState2Props = (state) => {
    return {
        task: taskSelector(state),
        users: usersSelector(state),
        elements: elementsSelector(state),
        fetching: fetchingSelector(state),
        isSupervisor: hasSupervisorRights(state),
        currentElement: currentElementSelector(state),
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
        user: userSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getTask, createTask, saveTask, getProcessElement}, dispatch)
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(TaskEditor)
