import React, {useEffect, useRef, useMemo, useState} from "react"
import {compose} from "redux"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {useParams} from "react-router-dom"
import {
    getProcess,
    saveProcess,
    // getProcessElement,
    processSelector,
    // usersSelector,
    // elementsSelector,
    // fetchingSelector,
    // currentElementSelector
} from "tt-ducks/process";
// import TaskHeader from "../../components/task-page/header";
import {getFormValues, isDirty, isValid, reduxForm,} from "redux-form";
// import TaskBody from "../../components/task-page/body";
import {hasSupervisorRights, userSelector,} from "tt-ducks/auth";
// import "./task-page.sass"
// import {COMMENT_ACTION} from "../../constants/common";
import ProcessHeader from "../../components/process-page/header";

const EDITOR_NAME = "PROCESS_EDITOR"

function ProcessEditor(props) {
    const {actions, process, fetching, isSupervisor, hasChanges, editorValues, currentElement} = props

    const params = useParams()

    useEffect(() => {
        actions.getProcess(params.taskId)
    }, [])

    useEffect(() => {
        if (process) {
            const _object = {
                Name: process.Name,
                State: process.State,
                ExecutorId: process.Executor.Id,
            }

            task.Fields.forEach((field) => {
                _object[field.name] = field.value
            })

            props.initialize(_object)
        }
    }, [process])

    const _save = () => {
        // const _commentText = editorValues.LastComment.trim() ? editorValues.LastComment : null
        //
        // const _value = {
        //     Id: task.Id,
        //     Name: editorValues.Name,
        //     State: +editorValues.State,
        //     ExecutorId: +editorValues.ExecutorId,
        //     DueDate: editorValues.DueDate.toISOString(),
        //     Description: editorValues.Description,
        //     ElementId: +editorValues.ElementId,
        //     IsElemReady: !!editorValues.IsElemReady,
        //     WriteFieldSet: editorValues.WriteFieldSet,
        //     Comment: !task.UserLastComment ? _commentText  : null,
        // }
        //
        // _value.Fields = {}
        // currentElement.Fields.forEach((field) => {
        //     _value.Fields[field.name] = editorValues[field.name]
        // })
        //
        // // Если есть последний комментарий пользователя и он его поменял, то
        // // при смене статуса этот комментарий будет новым в логе, если статус не поменялся, а комментарий изменился, то
        // // если новый комментарий пустой, запись надо удалить, иначе обновить
        // let userCommentAction = null
        // if (task.UserLastComment && (task.UserLastComment !== _commentText)) {
        //     if (task.State !== _value.State) {
        //         _value.Comment = _commentText
        //     } else {
        //         userCommentAction = {
        //             id: task.UserLastComment.Id,
        //             text: _commentText,
        //             action: _commentText && _commentText.trim() ? COMMENT_ACTION.UPDATE : COMMENT_ACTION.DELETE
        //         }
        //     }
        // }
        //
        // actions.saveTask({task: _value, comment: userCommentAction})
    }

    // useEffect(() => {
    //     const _elemId = editorValues && editorValues.ElementId
    //
    //     actions.getProcessElement(_elemId)
    // }, [editorValues && editorValues.ElementId])
    //
    // useEffect(() => {
    //     const _elemId = editorValues && editorValues.ElementId
    //
    //     actions.getProcessElement(_elemId)
    // }, [editorValues && editorValues.ElementId])
    //
    // const _onChangeElement = () => {
    //
    // }


    // return !fetching && task &&
    return <form className="process-editor-page form" action={"javascript:void(0)"}>
            <ProcessHeader hasChanged={hasChanges} taskId={task.Id} processName={task.Process.Name} onSave={_save}/>
            {/*<TaskBody task={task}*/}
            {/*          isSupervisor={isSupervisor}*/}
            {/*          elements={props.elements}*/}
            {/*          currentWriteFieldSet={editorValues && editorValues.WriteFieldSet}*/}
            {/*          users={props.users}*/}
            {/*          currentElement={currentElement}*/}
            {/*          onChangeElement={_onChangeElement}/>*/}
        </form>
}

const validate = (values) => {
    const errors = {}

    return errors
}

const mapState2Props = (state) => {
    return {
        process: processSelector(state),
        // users: usersSelector(state),
        // elements: elementsSelector(state),
        // fetching: fetchingSelector(state),
        user: userSelector(state),
        isSupervisor: hasSupervisorRights(state),
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getProcess,}, dispatch)
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(ProcessEditor)
